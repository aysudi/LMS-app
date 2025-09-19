import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["search", "suggestion"],
      default: "search",
    },
    metadata: {
      resultCount: {
        type: Number,
        min: 0,
      },
      selectedSuggestion: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

searchHistorySchema.index({ user: 1, timestamp: -1 });

export const SearchHistory = mongoose.model(
  "SearchHistory",
  searchHistorySchema
);
