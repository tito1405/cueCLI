# CueID Data Flow Architecture

## Overview
The CueID Normalization Platform ensures perfect creator/podcast/episode relationships with multi-source reconciliation. This document describes the complete data flow from ingestion to storage.

## Core Components

### 1. Data Ingestion Layer
```
External APIs → IngestionOrchestrator → BatchImporter → Database
```

- **IngestionOrchestrator**: Extends ApiOrchestrator with persistence
- **BatchImporter**: Orchestrates deduplication and quality control
- **Sources**: iTunes, Spotify, YouTube, Apple Podcasts

### 2. Data Processing Pipeline

```
Raw Content → Normalization → Deduplication → Quality Analysis → Storage
```

#### 2.1 Normalization (NormalizationService)
- Standardizes titles and descriptions
- Removes special characters
- Converts to lowercase for matching
- Maintains original and normalized versions

#### 2.2 Deduplication (DeduplicationEngine)
- CueID-based exact matching
- Fuzzy matching with Levenshtein distance
- 85% similarity threshold for high confidence
- 70% threshold triggers detailed comparison

#### 2.3 Quality Analysis (DataQualityAnalyzer)
- Six quality dimensions:
  - Completeness (35% weight)
  - Accuracy (25% weight)
  - Consistency (15% weight)
  - Timeliness (10% weight)
  - Validity (10% weight)
  - Uniqueness (5% weight)
- Grades: A+ to F
- Actionable recommendations

### 3. Database Schema

#### Enhanced Tables
- **content**: Unified table for all content types
- **source_mappings**: Multi-platform ID reconciliation
- **content_relationships**: Hierarchical relationships
- **quality_metrics**: Quality scores and grades
- **enrichment_queue_v2**: Prioritized enrichment tasks
- **normalization_cache**: Cached normalized text

#### Key Features
- CueID as primary identifier
- Self-referential foreign keys for hierarchy
- JSONB for flexible metadata
- Quality score tracking
- Multi-source support

### 4. CueID System

Format: `cue:[type]:[hash]:[source]:[confidence]`

Example: `cue:podcast:MTUwMjg3MTM5Mw==:apple:100`

- **type**: content type (creator, podcast, episode)
- **hash**: Base64 encoded identifier
- **source**: Original platform
- **confidence**: Match confidence (0-100)

## Data Flow Sequence

### Import Flow
1. **Search/Fetch**: External API call
2. **Transform**: Convert to internal format
3. **Generate CueID**: Create unique identifier
4. **Normalize**: Standardize text fields
5. **Deduplicate**: Check existing content
6. **Analyze Quality**: Score and grade
7. **Apply Threshold**: Accept/reject based on score
8. **Persist**: Store in database
9. **Create Relationships**: Link related content
10. **Schedule Enrichment**: Queue for enhancement

### Quality Control Gates
- **Gate 1**: Deduplication (prevent duplicates)
- **Gate 2**: Minimum quality score (default: 70)
- **Gate 3**: Acceptable grades (A+, A, A-, B+, B)
- **Gate 4**: Completeness check (key fields present)

## Configuration

### BatchImporter Settings
```javascript
{
  batchSize: 50,              // Items per batch
  minQualityScore: 70,        // Minimum quality threshold
  acceptableGrades: ['A+', 'A', 'A-', 'B+', 'B'],
  strictMode: false,          // Additional validation
  autoEnrich: true,           // Auto-schedule enrichment
  sources: ['spotify', 'youtube', 'apple']
}
```

### Quality Thresholds
- **Excellent**: 90-100 (A+/A)
- **Good**: 80-89 (A-/B+)
- **Fair**: 70-79 (B/B-)
- **Poor**: 60-69 (C+/C)
- **Reject**: <60 (C-/D/F)

## Monitoring & Metrics

### Import Session Tracking
- Total processed
- Successfully imported
- Duplicates found
- Quality rejected
- Error count
- Quality distribution
- Source breakdown

### Performance Metrics
- Deduplication rate
- Quality pass rate
- Processing time per batch
- API response times
- Database write performance

## Error Handling

### Retry Strategy
- 3 attempts per item
- Exponential backoff
- Fallback to cache
- Error logging with context

### Failure Modes
- API timeout: Skip and log
- Duplicate found: Track and continue
- Quality fail: Reject with reason
- Database error: Rollback transaction

## Future Enhancements

### Planned Features
1. Machine learning for quality prediction
2. Automated enrichment pipelines
3. Real-time deduplication cache
4. Cross-platform relationship discovery
5. Content clustering and similarity

### Scalability Considerations
- Batch processing for large datasets
- Connection pooling for database
- Caching layer for frequent lookups
- Async processing for enrichment
- Horizontal scaling ready

## API Endpoints (Future)

### Ingestion
- `POST /api/ingest/search` - Search and import
- `POST /api/ingest/batch` - Batch import
- `GET /api/ingest/status/:sessionId` - Check import status

### Quality
- `GET /api/quality/:cueId` - Get quality metrics
- `POST /api/quality/analyze` - Analyze content quality
- `GET /api/quality/recommendations/:cueId` - Get improvement recommendations

### Content
- `GET /api/content/:cueId` - Get content by CueID
- `GET /api/content/search` - Search content
- `GET /api/content/:cueId/relationships` - Get related content

## Conclusion

The CueID Normalization Platform provides a robust, scalable solution for managing podcast content with perfect relationships and multi-source reconciliation. The architecture ensures data quality through multiple validation gates while maintaining flexibility for future enhancements.