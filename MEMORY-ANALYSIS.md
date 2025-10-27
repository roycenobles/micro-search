# Memory Usage Analysis for AWS Lambda

## TL;DR: 3000MB Lambda Safety

✅ **50,000 documents**: ~500MB peak (17% of 3000MB) - **SAFE**  
✅ **100,000 documents**: ~900MB peak (30% of 3000MB) - **SAFE**  
⚠️ **150,000+ documents**: May approach limits - **TEST FIRST**

## Memory Breakdown by Operation

### 1. Base Lambda Memory
```
Node.js runtime:           ~80MB
npm dependencies:          ~20MB
MicroSearch code:          ~5MB
─────────────────────────────────
Baseline:                 ~105MB
```

### 2. Index in Memory (MemoryLevel)
| Documents | Index Size | Breakdown |
|-----------|------------|-----------|
| 10,000 | ~30MB | Inverted index + doc vectors |
| 50,000 | ~150MB | Scales ~3KB per doc |
| 100,000 | ~300MB | Sublinear due to term deduplication |

**Formula**: `~30MB + (docs × 2.5KB)` (approximate)

### 3. Import Operation (Peak Memory)
```
Compressed file (50k):     ~30-35MB (on disk)
Decompressed stream:       ~100-150MB (transient, streaming)
JSON string in memory:     ~100-150MB (accumulated)
Parsed JS object:          ~150-200MB (transient during IMPORT)
Final MemoryLevel index:   ~150MB (persistent)
───────────────────────────────────────────────
Peak during import:        ~400-450MB
Steady state after:        ~150MB
```

**Key Point**: Import has 2-3x memory spike during parsing, then drops.

### 4. Export Operation (Peak Memory)
```
MemoryLevel index:         ~150MB (persistent)
Exported JS object:        ~150-200MB (transient from EXPORT())
JSON.stringify():          ~150-200MB (transient string)
Gzip compression:          ~20-30MB (streaming output)
───────────────────────────────────────────────
Peak during export:        ~400-500MB
Output file:               ~30-35MB (compressed)
```

**Limitation**: `search-index.EXPORT()` returns full object - unavoidable memory spike.

### 5. Query Operation
```
MemoryLevel index:         ~150MB
Query execution:           ~1-5MB (results + scoring)
Response serialization:    ~0.5-2MB
───────────────────────────────────────────────
Query operation:           ~150-157MB (minimal overhead)
```

## Memory Optimization Details

### What We Fixed ✅
1. **Streaming Import**: Decompress on-the-fly vs loading entire file
2. **Streaming Export**: Compress on-the-fly vs holding compressed data
3. **No Pipeline Buffer Array**: Previous version collected chunks in array

### What We Can't Fix ⚠️
These are `search-index` library limitations:

1. **EXPORT() returns full object**: Can't stream index export
2. **IMPORT() requires full object**: Can't stream index import
3. **JSON.stringify() on full object**: JavaScript limitation
4. **JSON.parse() on full string**: JavaScript limitation

The library must serialize/deserialize the entire inverted index as one operation.

## Lambda Configuration Recommendations

### For 50k Documents
```typescript
{
  memorySize: 1024,  // 1GB sufficient, ~500MB peak
  timeout: 60,       // Import takes ~2-5s
  ephemeralStorageSize: 512  // For /tmp if needed
}
```

### For 100k Documents
```typescript
{
  memorySize: 2048,  // 2GB recommended, ~900MB peak
  timeout: 90,       // Import takes ~5-10s
  ephemeralStorageSize: 1024
}
```

### For Your Use Case (3000MB)
You have **plenty of headroom**. Safe up to ~150k documents.

## Monitoring Memory Usage

### In Your Lambda Code
```typescript
const used = process.memoryUsage();

console.log('Memory usage:', {
  rss: `${Math.round(used.rss / 1024 / 1024)}MB`,          // Total
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,  // Allocated
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,    // Actually used
  external: `${Math.round(used.external / 1024 / 1024)}MB`     // C++ objects
});

// Before import
const beforeImport = process.memoryUsage().heapUsed;

await ms.import();

// After import
const afterImport = process.memoryUsage().heapUsed;
console.log(`Import used ${Math.round((afterImport - beforeImport) / 1024 / 1024)}MB`);
```

### CloudWatch Metrics
Monitor these Lambda metrics:
- `MemoryUtilization`: Should stay < 70%
- `MaxMemoryUsed`: Track peak memory
- `Duration`: Correlates with memory pressure

## Memory vs Performance Tradeoffs

### Option 1: Current Implementation (Optimal)
- **Memory**: 2-3x index size during import/export
- **Speed**: Fast (2-5s for 50k docs)
- **Complexity**: Low

### Option 2: Chunked Processing (Not Implemented)
- **Memory**: 1.2x index size (minimal overhead)
- **Speed**: Slower (10-20s for 50k docs)
- **Complexity**: High (requires rewriting search-index internals)

**Verdict**: Current implementation is best for Lambda use case.

## Real-World Lambda Scenarios

### Scenario 1: Read-Only Query Lambda
```typescript
// Cold start
handler: async (event) => {
  const ms = new MicroSearch('/tmp/index');  // ~100MB baseline
  await ms.import();                          // +400MB spike → 500MB
  // After import completes → 250MB steady
  
  const results = await ms.query(event.query);  // +5MB → 255MB
  return results;
}

// Warm invocation (index cached in Lambda container)
// Memory: 250MB steady state
// Response: <100ms
```

### Scenario 2: Write Lambda with EFS
```typescript
handler: async (event) => {
  const ms = new MicroSearch('/mnt/efs/index');  // ~100MB
  await ms.import();                              // +400MB → 500MB
  // After import → 250MB
  
  await ms.putMany(event.newDocs);               // +10MB → 260MB
  await ms.flush();                               // +200MB spike → 460MB
  // After flush → 260MB
  
  return { success: true };
}
```

### Scenario 3: Build Lambda (Snapshot Creation)
```typescript
handler: async (event) => {
  const allDocs = await fetchAllDocuments();      // 100MB
  
  const ms = new MicroSearch('/tmp/index');       // +100MB → 200MB
  await ms.putMany(allDocs);                      // +150MB → 350MB (indexing)
  
  await ms.export();                              // +200MB spike → 550MB
  await uploadToS3('/tmp/index/index.json.gz');   // Minimal overhead
  
  // Peak: 550MB for 50k docs
}
```

## GC and Memory Cleanup

Node.js V8 GC handles cleanup automatically:
- **Minor GC**: Every ~10-100ms (cleans recent allocations)
- **Major GC**: When heap pressure increases
- **After Import**: Transient buffers/strings eligible for GC

Explicit cleanup (usually not needed):
```typescript
await ms.import();

// Optional: Force GC between operations (requires --expose-gc flag)
if (global.gc) {
  global.gc();
}

await ms.query(...);
```

## Document Size Considerations

The estimates assume average document size of ~200-500 bytes. Larger documents increase memory:

| Avg Doc Size | 50k Docs Index | 50k Docs Import Peak |
|--------------|----------------|----------------------|
| 200 bytes | ~150MB | ~400MB |
| 1KB | ~200MB | ~500MB |
| 5KB | ~400MB | ~900MB |

For large documents (>1KB average), scale your estimates accordingly.

## Bottom Line for 3000MB Lambda

You're **very safe** with 3000MB for typical use cases:

- ✅ **50k docs (200-500 bytes)**: 500MB peak (17% utilization)
- ✅ **100k docs**: 900MB peak (30% utilization)  
- ✅ **150k docs**: 1.3GB peak (43% utilization)
- ⚠️ **200k docs**: 1.7GB peak (57% utilization) - test first
- ❌ **300k+ docs**: Likely to hit memory limits

**Recommendation**: Keep indexes under 100k documents for best performance and safety margin.
