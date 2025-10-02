# Fix: Category Query Mismatch in Production

## 📋 Problem Summary

Publications were not appearing in production when filtered by category, even though they existed in the database.

### Root Cause

**Data Structure Mismatch:**
- **MongoDB documents** store categories as **nested objects**:
  ```json
  {
    "category": {
      "id": "empleos",
      "name": "Empleos",
      "slug": "empleos"
    }
  }
  ```

- **API query** was searching for categories as **flat strings**:
  ```typescript
  query.category = "empleos"  // ❌ This never matched
  ```

### Why It Happened

The bulk import script (`src/scripts/bulk-import-publications.ts`) creates publications with nested category objects:

```typescript
category: {
  id: data.category,
  name: data.category,
  slug: this.generateSlug(data.category)
}
```

But the API route handler (`src/app/api/publications/route.ts`) was querying for a flat string field.

---

## ✅ Solution

Updated the query builder to support **both formats** (backward compatible):

```typescript
if (category && category !== 'all') {
  andConditions.push({
    $or: [
      { category: category },           // Flat string (old format)
      { 'category.slug': category },    // Nested object (new format)
      { 'category.id': category }       // Nested object alternative
    ]
  })
}
```

This ensures:
1. **Existing documents** with nested categories are found ✅
2. **Future documents** with flat categories also work ✅
3. **Backward compatibility** is maintained ✅

---

## 🧪 Testing

### Before Fix
```bash
curl "https://www.buscadis.com/api/publications?category=empleos"
# Result: {"publications":[],"total":0}
```

### After Fix
```bash
curl "https://www.buscadis.com/api/publications?category=empleos"
# Result: {"publications":[...7 items...],"total":7}
```

---

## 📊 Impact

- **24 publications** were in the database but invisible in production
- **Homepage** showed 0 results for all categories
- **Category pages** were empty
- **Search** was working (different query path)

---

## 🔍 Debugging Process

1. ✅ Verified MongoDB connection was working
2. ✅ Confirmed data existed in Atlas (24 documents)
3. ✅ Checked cache issues (cleared with headers)
4. ✅ Verified API was being called
5. ✅ Added extensive logging
6. 🎯 **Found the issue:** Query was filtering by wrong field structure

---

## 📝 Files Changed

- `src/app/api/publications/route.ts` - Updated query builder to support nested categories
- `docs/CATEGORY_QUERY_FIX.md` - This documentation

---

## 💡 Lessons Learned

1. **Always log the actual MongoDB query** before execution
2. **Verify data structure** matches query expectations
3. **Use flexible queries** when data structure might vary
4. **Support backward compatibility** when changing schemas

---

## 🚀 Related Issues

- MongoDB connection pooling fix
- Cache control headers
- Text search vs regex search

All these were red herrings - the real issue was the category field mismatch.

