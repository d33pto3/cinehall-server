import { FilterQuery } from "mongoose";

/**
 * Builds a case-insensitive search query for provided fields.
 *
 * @param search - The search term (from req.query.search)
 * @param fields - Array of field names to search within (e.g. ["name", "address"])
 */
export const buildSearchQuery = <T>(
  search: string | undefined,
  fields: string[],
): FilterQuery<T> => {
  if (!search || !fields.length) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  } as FilterQuery<T>;
};
