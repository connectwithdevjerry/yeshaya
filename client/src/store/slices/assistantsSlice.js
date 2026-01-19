// src/store/slices/assistantsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// ✅ Fetch assistants
export const fetchAssistants = createAsyncThunk(
  "assistants/fetchAll",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get-all?subaccountId=${subaccountId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to fetch");
      }

      const cleanedData = (response.data.data || []).filter(Boolean);
      return cleanedData;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching assistants",
      );
    }
  },
);

// ✅ Get single assistant
export const getAssistantById = createAsyncThunk(
  "assistants/getAssistantById",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get?subaccountId=${subaccountId}&assistantId=${assistantId}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assistant",
      );
    }
  },
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
  },
);

// ✅ Update assistant
export const updateAssistant = createAsyncThunk(
  "assistants/update",
  async ({ subaccountId, assistantId, updateData }, { rejectWithValue }) => {
    try {
      if (!subaccountId || !assistantId) {
        return rejectWithValue(
          "Missing required fields: subaccountId or assistantId",
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
            "Failed to update assistant",
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Failed to update assistant");
      }
    }
  },
);

// ✅ Delete assistant
export const deleteAssistant = createAsyncThunk(
  "assistants/delete",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/assistants/delete?subaccountId=${subaccountId}&assistantId=${assistantId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Delete failed");
      }

      return assistantId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete assistant",
      );
    }
  },
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
          response.data.message || "Failed to save message",
        );
      }

      console.log("✅ Dynamic message added:", response.data.message);

      return { assistantId, message, type };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error saving dynamic message",
      );
    }
  },
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
          response.data.message || "Failed to generate prompt",
        );
      }

      console.log("✅ Prompt generated successfully:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error generating prompt",
      );
    }
  },
);

// 🆕 2. Get Dynamic Message
export const getDynamicMessage = createAsyncThunk(
  "assistants/getDynamicMessage",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching dynamic message:", {
        subaccountId,
        assistantId,
      });
      const response = await apiClient.get(
        `/assistants/get-dynamic-message?subaccountId=${subaccountId}&assistantId=${assistantId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch dynamic message",
        );
      }

      console.log("✅ Dynamic message fetched:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching dynamic message",
      );
    }
  },
);

// 🆕 3. Add Knowledge Base
export const addKnowledgeBase = createAsyncThunk(
  "assistants/addKnowledgeBase",
  async ({ knowledgeBaseUrl, title, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("type", type);

      if (type === "file") {
        formData.append("knowledgeBaseUrl", knowledgeBaseUrl);
      } else {
        formData.append("knowledgeBaseUrl", knowledgeBaseUrl);
      }

      const response = await apiClient.post(
        "/assistants/add-knowledge-bases",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error adding knowledge base",
      );
    }
  },
);
// 🆕 4. Delete Knowledge Base
export const deleteKnowledgeBase = createAsyncThunk(
  "assistants/deleteKnowledgeBase",
  async ({ toolId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Deleting knowledge base:", toolId);
      const response = await apiClient.delete(
        `/assistants/delete-knowlege-base?toolId=${toolId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to delete knowledge base",
        );
      }

      console.log("✅ Knowledge base deleted successfully");
      return toolId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error deleting knowledge base",
      );
    }
  },
);

// 🆕 5. Get File Details
export const getFileDetails = createAsyncThunk(
  "assistants/getFileDetails",
  async ({ fileId }, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching file details:", fileId);
      const response = await apiClient.get(
        `/assistants/get-file-details?fileId=${fileId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch file details",
        );
      }

      console.log("✅ File details fetched:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching file details",
      );
    }
  },
);

//
export const fetchKnowledgeBases = createAsyncThunk(
  "assistants/fetchKnowledgeBases",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/assistants/get-all-knowledge-bases",
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch knowledge bases",
        );
      }

      const rawData = response.data.data || [];

      return rawData.map((item) => {
        // Safe check for nested knowledgeBases array
        const kb =
          Array.isArray(item.knowledgeBases) && item.knowledgeBases.length > 0
            ? item.knowledgeBases[0]
            : {};

        return {
          id: item.id || "unknown",
          // Fallback to "Untitled" if description is missing
          name: kb.description || item.name || "Untitled Knowledge Base",
          updated: item.updatedAt
            ? new Date(item.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          created: item.createdAt
            ? new Date(item.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          sourcesCount: Array.isArray(kb.fileIds) ? kb.fileIds.length : 0,
          isVoiceEnabled: false,
        };
      });
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching knowledge bases",
      );
    }
  },
);

// ✅ 7. Link Knowledge Base to Assistant
export const linkKnowledgeBaseToAssistant = createAsyncThunk(
  "assistants/linkKnowledgeBase",
  async ({ assistantId, toolId }, { rejectWithValue }) => {
    try {
      // Using POST as is standard for linking resources
      const response = await apiClient.post(
        "/assistants/link-knowledge-bases-to-assistant",
        {
          assistantId,
          toolId,
        },
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to link knowledge base",
        );
      }

      return response.data; // Return the success data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error linking knowledge base",
      );
    }
  },
);

// ✅ 8. Get Knowledge Bases for a Specific Assistant
export const fetchAssistantKnowledgeBases = createAsyncThunk(
  "assistants/fetchAssistantKnowledgeBases",
  async (assistantId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get-assistant-knowledge-bases?assistantId=${assistantId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch assistant knowledge bases",
        );
      }

      // We return the data array
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Error fetching linked knowledge bases",
      );
    }
  },
);

// ✅ 9. Remove/Unlink Knowledge Base from Assistant
export const removeKnowledgeBaseFromAssistant = createAsyncThunk(
  "assistants/removeKnowledgeBase",
  async ({ assistantId, toolId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/assistants/remove-knowlege-base-from-assistant?assistantId=${assistantId}&toolId=${toolId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to remove knowledge base",
        );
      }

      // Return the toolId so we can filter it out of the state optimistically
      return toolId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error removing knowledge base",
      );
    }
  },
);

// ✅ 10. Add Calendar to Assistant
export const addCalendarToAssistant = createAsyncThunk(
  "assistants/addCalendar",
  async ({ accountId, assistantId, calendarId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/assistants/add-calendar", {
        accountId,
        assistantId,
        calendarId,
      });

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to add calendar",
        );
      }

      return response.data.data; // Returning the newly linked calendar info
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error adding calendar",
      );
    }
  },
);

// ✅ 11. Fetch Available GHL Calendars
export const fetchGHLCalendars = createAsyncThunk(
  "assistants/fetchGHLCalendars",
  async (subaccountId, { rejectWithValue }) => {
    // 1. Log the incoming argument immediately
    console.log("🔍 fetchGHLCalendars called with subaccountId:", subaccountId);

    if (!subaccountId) {
      console.error("❌ fetchGHLCalendars failed: subaccountId is missing!");
      return rejectWithValue("Subaccount ID is required to fetch calendars");
    }

    try {
      const response = await apiClient.get(
        `/assistants/get-available-ghl-calendars?subaccountId=${subaccountId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch calendars",
        );
      }

      console.log(
        "✅ Calendars fetched successfully for:",
        subaccountId,
        response.data.data,
      );
      return response.data.data || [];
    } catch (error) {
      console.error(
        "❌ API Error fetching calendars:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Error fetching calendars",
      );
    }
  },
);

// ✅ 12. Fetch Connected Calendar for Assistant
export const fetchConnectedCalendar = createAsyncThunk(
  "assistants/fetchConnectedCalendar",
  async ({ accountId, assistantId }, { rejectWithValue }) => {
    try {
      console.log(
        "🔍 Fetching connected calendar for Assistant:",
        assistantId,
        accountId,
      );

      const response = await apiClient.get(
        `/assistants/get-connected-calendar?accountId=${accountId}&assistantId=${assistantId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch connected calendar",
        );
      }

      console.log("✅ Connected calendar fetched:", response.data.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching connected calendar",
      );
    }
  },
);

// ✅ 13. Add Tool to Assistant
export const addToolToAssistant = createAsyncThunk(
  "assistants/addTool",
  async ({ assistantId, toolName }, { rejectWithValue }) => {
    try {
      // Postman screenshot shows x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("assistantId", assistantId);
      params.append("toolName", toolName);

      const response = await apiClient.post("/assistants/add-tool", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to add tool");
      }
      console.log("✅ Tool added successfully:", response.data.data);

      return { toolName, data: response.data.data };
    } catch (error) {
      console.error("❌ Error adding tool:", error);
      return rejectWithValue(
        error.response?.data?.message || "Error adding tool",
      );
    }
  },
);

// ✅ 14. Send Chat Message
export const sendChatMessage = createAsyncThunk(
  "assistants/sendChatMessage",
  async ({ assistantId, userText }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("assistantId", assistantId);
      params.append("userText", userText);

      const response = await apiClient.post(
        "/assistants/send-chat-message",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      // Your API structure uses .status and .reply
      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to send message",
        );
      }

      // Return the whole body so the component can access .reply
      console.log("✅ Chat message success:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error sending chat message",
      );
    }
  },
);

// ✅ 15. Get Assistant Call Logs (No ID required)
export const getAssistantCallLogs = createAsyncThunk(
  "assistants/getAssistantCallLogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/assistants/get-assistant-call-logs",
      );

      // The data you provided is a direct array.
      // If your apiClient (like Axios) puts the body in .data:
      const rawData = response.data;

      // Check if rawData is the array, or if it's nested in a 'data' property
      const callLogsData = Array.isArray(rawData)
        ? rawData
        : rawData.data || [];

      console.log("✅ Call logs fetched:", callLogsData);

      return callLogsData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching call logs",
      );
    }
  },
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
    fetchingKnowledgeBases: false,
    knowledgeBasesData: [],
    currentAssistantKBs: [],
    fetchingAssistantKBs: false,
    linkingKnowledgeBase: false,
    linkError: null,
    availableCalendars: [],
    fetchingCalendars: false,
    calendarError: null,
    linkingCalendar: false,
    connectedCalendar: null,
    fetchingConnectedCalendar: false,
    addingTool: false,
    toolError: null,
    assistantTools: [],
    sendingChat: false,
    chatError: null,
    chatHistory: [],
    callLogs: [],
    fetchingLogs: false,
    logsError: null,
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
    clearKnowledgeBaseError: (state) => {
      state.knowledgeBaseError = null;
    },
    optimisticUpdate: (state, action) => {
      const { assistantId, updateData } = action.payload;

      const index = state.data.findIndex(
        (a) => a.id === assistantId || a.assistantId === assistantId,
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
            a.id === action.payload.id || a.assistantId === action.payload.id,
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
          (a) => a.id !== action.payload && a.assistantId !== action.payload,
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
            message,
          );
        } else if (type === "outbound") {
          console.log(
            "✅ Outbound dynamic greeting saved successfully:",
            message,
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
      .addCase(addKnowledgeBase.fulfilled, (state) => {
        state.addingKnowledgeBase = false;
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
        state.knowledgeBasesData = state.knowledgeBasesData.filter(
          (kb) => kb.id !== action.payload,
        );
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
      })

      // 🔹 Fetch all knowledge bases
      .addCase(fetchKnowledgeBases.pending, (state) => {
        state.fetchingKnowledgeBases = true;
        state.knowledgeBaseError = null;
      })
      .addCase(fetchKnowledgeBases.fulfilled, (state, action) => {
        state.fetchingKnowledgeBases = false;
        state.knowledgeBasesData = action.payload;
      })
      .addCase(fetchKnowledgeBases.rejected, (state, action) => {
        state.fetchingKnowledgeBases = false;
        state.knowledgeBaseError = action.payload;
      })

      // Connect Knowledge Base to Assistant
      .addCase(linkKnowledgeBaseToAssistant.pending, (state) => {
        state.linkingKnowledgeBase = true;
        state.linkError = null;
      })
      .addCase(linkKnowledgeBaseToAssistant.fulfilled, (state) => {
        state.linkingKnowledgeBase = false;
        state.linkError = null;
        // You might want to update a specific assistant's state here if needed
      })
      .addCase(linkKnowledgeBaseToAssistant.rejected, (state, action) => {
        state.linkingKnowledgeBase = false;
        state.linkError = action.payload;
      })

      //fetching assistants knowledge bases
      .addCase(fetchAssistantKnowledgeBases.pending, (state) => {
        state.fetchingAssistantKBs = true;
      })
      .addCase(fetchAssistantKnowledgeBases.fulfilled, (state, action) => {
        state.fetchingAssistantKBs = false;
        state.currentAssistantKBs = action.payload;
      })
      .addCase(fetchAssistantKnowledgeBases.rejected, (state) => {
        state.fetchingAssistantKBs = false;
      })

      //remove knowledge base from assistant
      .addCase(removeKnowledgeBaseFromAssistant.pending, (state) => {
        state.linkingKnowledgeBase = true;
      })
      .addCase(removeKnowledgeBaseFromAssistant.fulfilled, (state, action) => {
        state.linkingKnowledgeBase = false;
        state.currentAssistantKBs = state.currentAssistantKBs.filter(
          (kb) => kb.id !== action.payload,
        );
      })
      .addCase(removeKnowledgeBaseFromAssistant.rejected, (state, action) => {
        state.linkingKnowledgeBase = false;
        state.linkError = action.payload;
      })

      //add calendar to assistant
      .addCase(addCalendarToAssistant.pending, (state) => {
        state.linkingCalendar = true;
        state.calendarError = null;
      })
      .addCase(addCalendarToAssistant.fulfilled, (state, action) => {
        state.linkingCalendar = false;
        if (state.selectedAssistant) {
          state.selectedAssistant.calendar = action.payload;
        }
      })
      .addCase(addCalendarToAssistant.rejected, (state, action) => {
        state.linkingCalendar = false;
        state.calendarError = action.payload;
      })

      //get ghl calendars
      .addCase(fetchGHLCalendars.pending, (state) => {
        state.fetchingCalendars = true;
        state.calendarError = null;
      })
      .addCase(fetchGHLCalendars.fulfilled, (state, action) => {
        state.fetchingCalendars = false;
        state.availableCalendars = action.payload;
      })
      .addCase(fetchGHLCalendars.rejected, (state, action) => {
        state.fetchingCalendars = false;
        state.calendarError = action.payload;
      })

      // 🔹 Fetch Connected Calendar
      .addCase(fetchConnectedCalendar.pending, (state) => {
        state.fetchingConnectedCalendar = true;
        state.calendarError = null;
      })
      .addCase(fetchConnectedCalendar.fulfilled, (state, action) => {
        state.fetchingConnectedCalendar = false;
        state.connectedCalendar = action.payload; // This stores the { calendarId, assistantId, ... } object
      })
      .addCase(fetchConnectedCalendar.rejected, (state, action) => {
        state.fetchingConnectedCalendar = false;
        state.calendarError = action.payload;
      })

      // 🔹 Add Tool to Assistant
      .addCase(addToolToAssistant.pending, (state) => {
        state.addingTool = true;
        state.toolError = null;
      })
      .addCase(addToolToAssistant.fulfilled, (state, action) => {
        state.addingTool = false;
        // Check if tool already exists before pushing
        const exists = state.assistantTools.includes(action.payload.toolName);
        if (!exists) {
          state.assistantTools.push(action.payload.toolName);
        }
      })
      .addCase(addToolToAssistant.rejected, (state, action) => {
        state.addingTool = false;
        state.toolError = action.payload;
      })

      // 🔹 Send Chat Message
      .addCase(sendChatMessage.pending, (state) => {
        state.sendingChat = true;
        state.chatError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sendingChat = false;
        // If your API returns the full conversation or just the new reply:
        // state.chatHistory.push(action.payload);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendingChat = false;
        state.chatError = action.payload;
      })

      // 🔹 Get Assistant Call Logs
      .addCase(getAssistantCallLogs.pending, (state) => {
        console.log("⏳ Reducer: getAssistantCallLogs.pending");
        state.fetchingLogs = true;
        state.logsError = null;
      })
      .addCase(getAssistantCallLogs.fulfilled, (state, action) => {

        state.fetchingLogs = false;
        // Create a new array reference to force update
        state.callLogs = Array.isArray(action.payload)
          ? [...action.payload]
          : [];
      })
      .addCase(getAssistantCallLogs.rejected, (state, action) => {
        state.fetchingLogs = false;
        state.logsError = action.payload;
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
  clearKnowledgeBaseError,
} = assistantsSlice.actions;

export default assistantsSlice.reducer;
