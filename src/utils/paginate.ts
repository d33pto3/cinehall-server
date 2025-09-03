// This is a generic reusable pagination function for MongoDB collections using Mongoose in Node.js

import { Document, Model, PopulateOptions, FilterQuery } from "mongoose";

// types of value which can be used to filter in MongoDB
type FilterValue =
  | string
  | number
  | boolean
  | Date
  | RegExp
  | FilterObject
  | FilterValue[]; // Array of FilterValues (allows nested arrays)

/**
 * MongoDB query operators used in filters.
 * Each operator takes one or more FilterValues or FilterObjects.
 */
type MongoOperators = {
  $eq?: FilterValue; // Equals
  $ne?: FilterValue; // Not equals
  $gt?: FilterValue; // Greater than
  $gte?: FilterValue; // Greater than or equal
  $lt?: FilterValue; // Less than
  $lte?: FilterValue; // Less than or equal
  $in?: FilterValue[]; // Value is in the given array
  $nin?: FilterValue[]; // Value is not in the given array
  $regex?: RegExp | string; // Regular expression match
  $exists?: boolean; // Field existence check
  $and?: FilterObject[]; // Logical AND of filter objects
  $or?: FilterObject[]; // Logical OR of filter objects
  $not?: FilterObject; // Logical NOT of a filter object
  $nor?: FilterObject[]; // Logical NOR of filter objects
};

// Generic object where
// key - name of the MongoDB field (ex: 'age', 'email', 'status', etc.)
// value - can be any value (ex: 'john' 30, true) or MongoDB operators ({$gt: 10})
interface FilterObject {
  [key: string]: FilterValue | MongoOperators;
}

// Options that are passed
interface PaginationOptions<T> {
  page?: number; // Page number (default: 1)
  limit?: number; // Number of items per page (default: 10)
  sort?: string; // Sort order, e.g. "field:asc" or "field:desc"
  filter?: FilterQuery<T>; // MongoDB filter query for documents
  projection?: Record<string, 0 | 1>; // Fields to include(1) or exclude(0)
  populate?: string | PopulateOptions | (string | PopulateOptions)[]; // Populate referenced documents
}

// Return result
interface PaginatedResult<T> {
  data: T[]; // The array of items for a current page
  total: number; // Total number of matching documents/items
  page: number; // Current page number
  pages: number; // Total number of pages
  limit: number; // Number of items per page
}

// paginate is a generic async function that works with any Mongoose Model
export const paginate = async <T extends Document>(
  model: Model<T>, // Mongoose Model
  options: PaginationOptions<T> = {}, // pagination related options
  // Returns a promise that resolves to a paginated result
): Promise<PaginatedResult<T>> => {
  const {
    page = 1,
    limit = 10,
    sort,
    filter = {} as FilterQuery<T>, // Mongoose query type
    projection = {},
    populate,
  } = options;

  // calculates how many documents to skip (page 1 - 0, page 2 - 10)
  const skip = (page - 1) * limit;

  // mongoose model is called with filter and projection
  const query = model.find(filter, projection).skip(skip).limit(limit);

  // handle sorting
  if (sort) {
    const [key, direction] = sort.split(":");
    query.sort({ [key]: direction === "desc" ? -1 : 1 });
  }

  // fetches related documents (from other models)
  if (populate) {
    if (typeof populate === "string" || Array.isArray(populate)) {
      query.populate(populate as string | string[]);
    } else {
      query.populate(populate as PopulateOptions);
    }
  }

  //   if (populate) {
  //   if (Array.isArray(populate)) {
  //     query.populate(populate.map(p =>
  //       typeof p === 'string' ? { path: p } : p
  //     ));
  //   } else {
  //     query.populate(
  //       typeof populate === 'string'
  //         ? { path: populate }
  //         : populate
  //     );
  //   }
  // }

  // both of query execution and counting total are async task. Promise.all() is used so that one of this doesn't stop for the other. When both of these are finished we get the result back
  const [data, total] = await Promise.all([
    query.exec(), // execute query
    model.countDocuments(filter), // count total
  ]);

  // Calculate page count safely
  const pageCount = limit > 0 ? Math.ceil(total / limit) : total > 0 ? 1 : 0;

  return {
    data,
    total,
    page,
    pages: pageCount,
    limit,
  };
};
