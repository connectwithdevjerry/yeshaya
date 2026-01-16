// src/store/slices/assistantsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// ✅ Fetch assistants
export const fetchAssistants = createAsyncThunk(
  "assistants/fetchAll",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get-all?subaccountId=${subaccountId}`
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to fetch");
      }

      const cleanedData = (response.data.data || []).filter(Boolean);
      return cleanedData;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching assistants"
      );
    }
  }
);

// ✅ Get single assistant
export const getAssistantById = createAsyncThunk(
  "assistants/getAssistantById",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assistant"
      );
    }
  }
);

// ✅ Create assistant
export const createAssistant = createAsyncThunk(
  "assistants/create",
  async ({ name, description, subaccountId }, { rejectWithValue }) => {
    try {
      const payload = { name, description, subaccountId };
      const response = await apiClient.post("/assistants/create", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Update assistant 
export const updateAssistant = createAsyncThunk(
  "assistants/update",
  async ({ subaccountId, assistantId, updateData }, { rejectWithValue }) => {
    try {
      if (!subaccountId || !assistantId) {
        return rejectWithValue(
          "Missing required fields: subaccountId or assistantId"
        );
      }
      const payload = {
        subaccountId,
        assistantId,
        updateData,
      };

      console.log("🔄 Updating assistant:", payload);

      const response = await apiClient.put("/assistants/update", payload);

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Update failed");
      }

      console.log("✅ Assistant updated successfully:", response.data.data);

      return response.data.data;
    } catch (error) {
      console.error("❌ Update assistant error:", error);

      if (error.response) {
        return rejectWithValue(
          error.response.data?.message ||
            error.response.data?.error ||
            "Failed to update assistant"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Failed to update assistant");
      }
    }
  }
);

// ✅ Delete assistant
export const deleteAssistant = createAsyncThunk(
  "assistants/delete",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/assistants/delete?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Delete failed");
      }

      return assistantId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete assistant"
      );
    }
  }
);

// ✅ Add Dynamic Message
export const addDynamicMessage = createAsyncThunk(
  "assistants/addDynamicMessage",
  async ({ assistantId, message, type }, { rejectWithValue }) => {
    try {
      console.log("🔄 Adding dynamic message:", { assistantId, message, type });
      const response = await apiClient.post("/assistants/add-dynamic-message", {
        assistantId,
        message,
        type,
      });

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to save message"
        );
      }

      console.log("✅ Dynamic message added:", response.data.message);

      return { assistantId, message, type };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error saving dynamic message"
      );
    }
  }
);

// 🆕 1. Generate Prompt
export const generatePrompt = createAsyncThunk(
  "assistants/generatePrompt",
  async ({ description }, { rejectWithValue }) => {
    try {
      console.log("🔄 Generating prompt for description:", description);
      const response = await apiClient.post("/assistants/generate-prompt", {
        description,
      });

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to generate prompt"
        );
      }

      console.log("✅ Prompt generated successfully:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error generating prompt"
      );
    }
  }
);

// 🆕 2. Get Dynamic Message
export const getDynamicMessage = createAsyncThunk(
  "assistants/getDynamicMessage",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching dynamic message:", { subaccountId, assistantId });
      const response = await apiClient.get(
        `/assistants/get-dynamic-message?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch dynamic message"
        );
      }

      console.log("✅ Dynamic message fetched:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching dynamic message"
      );
    }
  }
);

// 🆕 3. Add Knowledge Base
export const addKnowledgeBase = createAsyncThunk(
  "assistants/addKnowledgeBase",
  async ({ assistantId, knowledgeBaseUrl, title, type }, { rejectWithValue }) => {
    try {
      console.log("🔄 Adding knowledge base:", { assistantId, title, type });
      const payload = {
        assistantId,
        knowledgeBaseUrl,
        title,
        type,
      };

      const response = await apiClient.post("/assistants/add-knowledge-bases", payload);

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to add knowledge base"
        );
      }

      console.log("✅ Knowledge base added:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error adding knowledge base"
      );
    }
  }
);

// 🆕 4. Delete Knowledge Base
export const deleteKnowledgeBase = createAsyncThunk(
  "assistants/deleteKnowledgeBase",
  async ({ toolId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Deleting knowledge base:", toolId);
      const response = await apiClient.delete(
        `/assistants/delete-knowlege-base?toolId=${toolId}`
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to delete knowledge base"
        );
      }

      console.log("✅ Knowledge base deleted successfully");
      return toolId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error deleting knowledge base"
      );
    }
  }
);

// 🆕 5. Get File Details
export const getFileDetails = createAsyncThunk(
  "assistants/getFileDetails",
  async ({ fileId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching file details:", fileId);
      const response = await apiClient.get(
        `/assistants/get-file-details?fileId=${fileId}`
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch file details"
        );
      }

      console.log("✅ File details fetched:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching file details"
      );
    }
  }
);

const assistantsSlice = createSlice({
  name: "assistants",
  initialState: {
    data: [],
    selectedAssistant: null,
    loading: false,
    error: null,
    updating: false,
    updateError: null,
    savingMessage: false,
    messageError: null,
    // New states for the additional endpoints
    generatingPrompt: false,
    generatedPrompt: null,
    promptError: null,
    dynamicMessage: null,
    fetchingDynamicMessage: false,
    dynamicMessageError: null,
    addingKnowledgeBase: false,
    knowledgeBaseError: null,
    deletingKnowledgeBase: false,
    fileDetails: null,
    fetchingFileDetails: false,
    fileDetailsError: null,
  },
  reducers: {
    clearSelectedAssistant: (state) => {
      state.selectedAssistant = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearGeneratedPrompt: (state) => {
      state.generatedPrompt = null;
      state.promptError = null;
    },
    clearDynamicMessage: (state) => {
      state.dynamicMessage = null;
      state.dynamicMessageError = null;
    },
    clearFileDetails: (state) => {
      state.fileDetails = null;
      state.fileDetailsError = null;
    },
    optimisticUpdate: (state, action) => {
      const { assistantId, updateData } = action.payload;

      const index = state.data.findIndex(
        (a) => a.id === assistantId || a.assistantId === assistantId
      );
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updateData };
      }

      if (
        state.selectedAssistant?.assistantId === assistantId ||
        state.selectedAssistant?.id === assistantId
      ) {
        state.selectedAssistant = { ...state.selectedAssistant, ...updateData };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch
      .addCase(fetchAssistants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssistants.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchAssistants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Create
      .addCase(createAssistant.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAssistant.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Get single
      .addCase(getAssistantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssistantById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssistant = action.payload;
      })
      .addCase(getAssistantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Update
      .addCase(updateAssistant.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateAssistant.fulfilled, (state, action) => {
        state.updating = false;

        const index = state.data.findIndex(
          (a) =>
            a.id === action.payload.id || a.assistantId === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }

        if (
          state.selectedAssistant?.assistantId === action.payload.id ||
          state.selectedAssistant?.id === action.payload.id
        ) {
          state.selectedAssistant = {
            ...state.selectedAssistant,
            ...action.payload,
          };
        }
      })
      .addCase(updateAssistant.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      })

      // 🔹 Delete
      .addCase(deleteAssistant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAssistant.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (a) => a.id !== action.payload && a.assistantId !== action.payload
        );
        if (
          state.selectedAssistant?.id === action.payload ||
          state.selectedAssistant?.assistantId === action.payload
        ) {
          state.selectedAssistant = null;
        }
      })
      .addCase(deleteAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Add Dynamic Message
      .addCase(addDynamicMessage.pending, (state) => {
        state.savingMessage = true;
        state.messageError = null;
      })
      .addCase(addDynamicMessage.fulfilled, (state, action) => {
        state.savingMessage = false;

        const { assistantId, message, type } = action.payload;

        if (type === "inbound") {
          console.log(
            "✅ Inbound dynamic greeting saved successfully:",
            message
          );
        } else if (type === "outbound") {
          console.log(
            "✅ Outbound dynamic greeting saved successfully:",
            message
          );
        }

        if (
          state.selectedAssistant?.id === assistantId ||
          state.selectedAssistant?.assistantId === assistantId
        ) {
          state.selectedAssistant = {
            ...state.selectedAssistant,
            [type === "inbound" ? "inboundMessage" : "outboundMessage"]:
              message,
          };
        }
      })
      .addCase(addDynamicMessage.rejected, (state, action) => {
        state.savingMessage = false;
        state.messageError = action.payload;
      })

      // 🔹 Generate Prompt
      .addCase(generatePrompt.pending, (state) => {
        state.generatingPrompt = true;
        state.promptError = null;
      })
      .addCase(generatePrompt.fulfilled, (state, action) => {
        state.generatingPrompt = false;
        state.generatedPrompt = action.payload;
      })
      .addCase(generatePrompt.rejected, (state, action) => {
        state.generatingPrompt = false;
        state.promptError = action.payload;
      })

      // 🔹 Get Dynamic Message
      .addCase(getDynamicMessage.pending, (state) => {
        state.fetchingDynamicMessage = true;
        state.dynamicMessageError = null;
      })
      .addCase(getDynamicMessage.fulfilled, (state, action) => {
        state.fetchingDynamicMessage = false;
        state.dynamicMessage = action.payload;
      })
      .addCase(getDynamicMessage.rejected, (state, action) => {
        state.fetchingDynamicMessage = false;
        state.dynamicMessageError = action.payload;
      })

      // 🔹 Add Knowledge Base
      .addCase(addKnowledgeBase.pending, (state) => {
        state.addingKnowledgeBase = true;
        state.knowledgeBaseError = null;
      })
      .addCase(addKnowledgeBase.fulfilled, (state, action) => {
        state.addingKnowledgeBase = false;
        // You might want to update the selectedAssistant with the new knowledge base
        if (state.selectedAssistant) {
          if (!state.selectedAssistant.knowledgeBases) {
            state.selectedAssistant.knowledgeBases = [];
          }
          state.selectedAssistant.knowledgeBases.push(action.payload);
        }
      })
      .addCase(addKnowledgeBase.rejected, (state, action) => {
        state.addingKnowledgeBase = false;
        state.knowledgeBaseError = action.payload;
      })

      // 🔹 Delete Knowledge Base
      .addCase(deleteKnowledgeBase.pending, (state) => {
        state.deletingKnowledgeBase = true;
        state.knowledgeBaseError = null;
      })
      .addCase(deleteKnowledgeBase.fulfilled, (state, action) => {
        state.deletingKnowledgeBase = false;
        // Remove the knowledge base from selectedAssistant
        if (state.selectedAssistant?.knowledgeBases) {
          state.selectedAssistant.knowledgeBases = 
            state.selectedAssistant.knowledgeBases.filter(
              (kb) => kb.toolId !== action.payload
            );
        }
      })
      .addCase(deleteKnowledgeBase.rejected, (state, action) => {
        state.deletingKnowledgeBase = false;
        state.knowledgeBaseError = action.payload;
      })

      // 🔹 Get File Details
      .addCase(getFileDetails.pending, (state) => {
        state.fetchingFileDetails = true;
        state.fileDetailsError = null;
      })
      .addCase(getFileDetails.fulfilled, (state, action) => {
        state.fetchingFileDetails = false;
        state.fileDetails = action.payload;
      })
      .addCase(getFileDetails.rejected, (state, action) => {
        state.fetchingFileDetails = false;
        state.fileDetailsError = action.payload;
      });
  },
});

export const { 
  clearSelectedAssistant, 
  clearUpdateError, 
  optimisticUpdate,
  clearGeneratedPrompt,
  clearDynamicMessage,
  clearFileDetails,
} = assistantsSlice.actions;

export default assistantsSlice.reducer;