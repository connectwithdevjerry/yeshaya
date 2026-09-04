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

// Team notes — fetch & save
export const fetchTeamNotes = createAsyncThunk(
  "assistants/fetchTeamNotes",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/assistants/get-team-notes?subaccountId=${subaccountId}&assistantId=${assistantId}`);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to load notes");
      return res.data.data?.teamNotes || "";
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load team notes");
    }
  },
);

export const saveTeamNotes = createAsyncThunk(
  "assistants/saveTeamNotes",
  async ({ subaccountId, assistantId, teamNotes }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put("/assistants/update-team-notes", { subaccountId, assistantId, teamNotes });
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to save");
      return res.data.data?.teamNotes ?? teamNotes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save team notes");
    }
  },
);

// Chat Lab history — the assistant's durable memory of this tester's thread.
// Chat history is stored server-side (shared with the voice, SMS, and widget
// channels), so the panel can restore it after a reload instead of starting
// blank while the assistant still remembers the conversation.
export const fetchChatHistory = createAsyncThunk(
  "assistants/fetchChatHistory",
  async ({ assistantId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/memory/chat-history?assistantId=${assistantId}`);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to load history");
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load chat history");
    }
  },
);

export const clearChatHistory = createAsyncThunk(
  "assistants/clearChatHistory",
  async ({ assistantId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/memory/chat-history?assistantId=${assistantId}`);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to clear history");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear chat history");
    }
  },
);

// Toggle favorite / archived on an assistant
export const setAssistantMeta = createAsyncThunk(
  "assistants/setMeta",
  async ({ subaccountId, assistantId, favorite, archived }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/assistants/assistant-meta", { subaccountId, assistantId, favorite, archived });
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to update");
      return { assistantId, favorite, archived };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update assistant");
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
  async ({ knowledgeBaseUrl, title, type, subaccountId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("type", type);
      // FAQ sends an array of {q,a}; files send a File; others send a string.
      // Serialize non-string, non-File payloads as JSON so the server can parse.
      const isFile = typeof File !== "undefined" && knowledgeBaseUrl instanceof File;
      formData.append(
        "knowledgeBaseUrl",
        (typeof knowledgeBaseUrl === "string" || isFile) ? knowledgeBaseUrl : JSON.stringify(knowledgeBaseUrl),
      );
      if (subaccountId) formData.append("subaccountId", subaccountId);

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
  async (subaccountId, { rejectWithValue }) => {
    try {
      const query = subaccountId ? `?subaccountId=${subaccountId}` : "";
      const response = await apiClient.get(
        `/assistants/get-all-knowledge-bases${query}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch knowledge bases",
        );
      }

      const rawData = response.data.data || [];

      console.log("✅ Knowledge bases fetched:", rawData);

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
          fileIds: Array.isArray(kb.fileIds) ? kb.fileIds : [],
          // Phase A/B persisted metadata (null for legacy uploads pre-feature)
          type: item.meta?.type || undefined,
          meta: item.meta || null,
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
        return rejectWithValue({
          message: response.data.message || "Failed to fetch calendars",
          reconnectRequired: !!response.data.reconnectRequired,
        });
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
        return rejectWithValue({
          message: response.data.message || "Failed to fetch connected calendar",
          reconnectRequired: !!response.data.reconnectRequired,
          // Distinguishes "never linked" from "linked, but the calendar is gone
          // from GoHighLevel" — different problems, different fixes.
          calendarLinked: response.data.calendarLinked !== false,
          calendarMissing: !!response.data.calendarMissing,
        });
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

// Fetch the tools currently attached to an assistant (for "Added" state)
export const fetchAssistantTools = createAsyncThunk(
  "assistants/fetchTools",
  async (assistantId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/assistants/get-tools?assistantId=${assistantId}`);
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to fetch tools");
      }
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching tools");
    }
  },
);

// Fetch a location's GHL custom fields + the assistant's saved mapping
export const fetchGhlCustomFields = createAsyncThunk(
  "assistants/fetchGhlCustomFields",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/assistants/ghl-custom-fields?subaccountId=${subaccountId}&assistantId=${assistantId}`,
      );
      if (res.data?.reconnectRequired) return rejectWithValue("Reconnect GoHighLevel to load custom fields.");
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to load custom fields");
      return { fields: res.data.fields || [], map: res.data.map || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error loading custom fields");
    }
  },
);

// Save which custom fields this assistant should collect
export const saveCustomFieldMap = createAsyncThunk(
  "assistants/saveCustomFieldMap",
  async ({ subaccountId, assistantId, map }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/assistants/custom-field-map", { subaccountId, assistantId, map });
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to save");
      return map;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error saving mapping");
    }
  },
);

// Search a knowledge base's stored text (embedding playground)
export const searchKnowledgeBase = createAsyncThunk(
  "assistants/searchKnowledgeBase",
  async ({ toolId, query }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/assistants/kb-search?toolId=${encodeURIComponent(toolId)}&query=${encodeURIComponent(query)}`,
      );
      if (!res.data.status) return rejectWithValue(res.data.message || "Search failed");
      return { results: res.data.results || [], message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error searching knowledge base");
    }
  },
);

// Import an existing Vapi tool by ID
export const importToolToAssistant = createAsyncThunk(
  "assistants/importTool",
  async ({ assistantId, toolId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/assistants/import-tool", { assistantId, toolId });
      if (!response.data.status) return rejectWithValue(response.data.message || "Failed to import tool");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error importing tool");
    }
  },
);

// Create a custom webhook (function) tool
export const createCustomTool = createAsyncThunk(
  "assistants/createCustomTool",
  async ({ assistantId, name, description, serverUrl }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/assistants/create-custom-tool", { assistantId, name, description, serverUrl });
      if (!response.data.status) return rejectWithValue(response.data.message || "Failed to create tool");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error creating tool");
    }
  },
);

// Remove a tool from an assistant
export const removeToolFromAssistant = createAsyncThunk(
  "assistants/removeTool",
  async ({ accountId, assistantId, toolId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete("/assistants/delete-tool", {
        data: { accountId, assistantId, toolId },
      });
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to remove tool");
      }
      return { toolId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error removing tool");
    }
  },
);

// Unlink the calendar from an assistant
export const removeCalendarFromAssistant = createAsyncThunk(
  "assistants/removeCalendar",
  async ({ accountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/assistants/remove-calendar", { accountId, assistantId });
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to unlink calendar");
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error unlinking calendar");
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
        // Surface the real reason — e.g. wallet-too-low comes back in `reply`,
        // Vapi errors come back in `message`.
        const replyMsg = response.data.reply?.[0]?.content;
        return rejectWithValue(
          response.data.message || replyMsg || "Failed to send message",
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

// ✅ 15. Get Assistant Call Logs
export const getAssistantCallLogs = createAsyncThunk(
  "assistants/getAssistantCallLogs",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const query = subaccountId ? `?subaccountId=${subaccountId}` : "";
      const response = await apiClient.get(
        `/assistants/get-assistant-call-logs${query}`,
      );
      const rawData = response.data;

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

// ✅ 16. Generate Outbound Call URL
export const generateOutboundCallUrl = createAsyncThunk(
  "assistants/generateOutboundUrl",
  async ({ assistantId }, { rejectWithValue }) => {
    try {
      // Constructing: /assistants/generate-outbound-call-url?assistantId=f2efd35...
      const response = await apiClient.get(
        `/assistants/generate-outbound-call-url?assistantId=${assistantId}`,
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to generate outbound URL",
        );
      }

      // Based on your example response: { status: true, data: { url: "..." } }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error generating outbound URL",
      );
    }
  },
);

// ✅ 17. Fetch Wallet Balance
export const fetchWalletBalance = createAsyncThunk(
  "assistants/fetchWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      // No query params needed as per your requirement
      const response = await apiClient.get("/assistants/get-wallet-balance");

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch balance",
        );
      }

      console.log("✅ Wallet balance fetched:", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching wallet balance",
      );
    }
  },
);

// ✅ 18. Fetch Transaction History
export const fetchTransactionHistory = createAsyncThunk(
  "transactions/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/integrations/get-transaction-history",
      );

      // Based on your previous API patterns:
      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch transactions",
        );
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching transaction history",
      );
    }
  },
);

// ✅ 19. Contacts Management Thunks
export const fetchContacts = createAsyncThunk(
  "assistants/fetchContacts",
  async ({ subaccountId, source = "assistant" }, { rejectWithValue }) => {
    try {
      // source=assistant → only people the assistants actually spoke to.
      // source=all       → app-saved contacts plus the whole GHL address book.
      const response = await apiClient.get(
        `/assistants/get-contacts?subaccountId=${subaccountId}&source=${source}`,
      );
      return response.data.status
        ? response.data.data
        : rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contacts",
      );
    }
  },
);

// ✅ 20. Create Contact
export const createContact = createAsyncThunk(
  "assistants/createContact",
  async ({ subaccountId, contactData }, { rejectWithValue }) => {
    try {
      // Convert JSON object to x-www-form-urlencoded format per Postman screenshot
      const params = new URLSearchParams();
      Object.keys(contactData).forEach((key) =>
        params.append(key, contactData[key]),
      );

      const response = await apiClient.post(
        `/assistants/create-contact?subaccountId=${subaccountId}`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      return response.data.status
        ? { data: response.data.data, merged: response.data.merged || false }
        : rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create contact",
      );
    }
  },
);

// ✅ 20b. Bulk Import Contacts
export const importContacts = createAsyncThunk(
  "assistants/importContacts",
  async ({ subaccountId, contacts }, { rejectWithValue }) => {
    try {
      console.log(`🔄 importContacts → ${contacts.length} contacts`);
      const response = await apiClient.post(
        `/assistants/import-contacts?subaccountId=${subaccountId}`,
        { contacts },
      );
      console.log("✅ importContacts →", response.data);
      return response.data.status
        ? response.data.result
        : rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import contacts",
      );
    }
  },
);

// ✅ 21. Update Contact
export const updateContact = createAsyncThunk(
  "assistants/updateContact",
  async ({ subaccountId, contactId, contactData }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.keys(contactData).forEach((key) =>
        params.append(key, contactData[key]),
      );

      const response = await apiClient.put(
        `/assistants/update-contact?subaccountId=${subaccountId}&contactId=${contactId}`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      return response.data.status
        ? response.data.data
        : rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contact",
      );
    }
  },
);

// ✅ 22. Delete Contact
export const deleteContact = createAsyncThunk(
  "assistants/deleteContact",
  async ({ subaccountId, contactId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/assistants/delete-contact?subaccountId=${subaccountId}&contactId=${contactId}`,
      );
      return response.data.status
        ? contactId
        : rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete contact",
      );
    }
  },
);

// ✅ 24. Get Sub-account Spend Breakdown
export const fetchSubAccountSpend = createAsyncThunk(
  "assistants/fetchSubAccountSpend",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 fetchSubAccountSpend → requesting");
      const response = await apiClient.get("/assistants/subaccount-spend");
      console.log("✅ fetchSubAccountSpend →", response.data);
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to fetch sub-account spend");
      }
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch sub-account spend";
      console.error("❌ fetchSubAccountSpend →", message);
      return rejectWithValue(message);
    }
  }
);

// ✅ 23. Get Assistant Analytics
export const getAssistantAnalytics = createAsyncThunk(
  "assistants/getAnalytics",
  async (arg, { rejectWithValue }) => {
    try {
      // arg may be a subaccountId string, or { subaccountId, force } to bypass cache
      const subaccountId = typeof arg === "object" && arg !== null ? arg.subaccountId : arg;
      const force = typeof arg === "object" && arg !== null ? arg.force : false;
      const params = new URLSearchParams();
      if (subaccountId) params.set("subaccountId", subaccountId);
      if (force) params.set("refresh", "1");
      const qs = params.toString();
      const response = await apiClient.get(`/assistants/get-analytics${qs ? `?${qs}` : ""}`);

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch analytics",
        );
      }

      console.log("Analytics Data:", response.data);
      return response.data;
    } catch (error) {
      // Extract specific server error message
      const message =
        error.response?.data?.message || "Failed to fetch analytics";
      console.error("Analytics Error:", message);
      return rejectWithValue(message);
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
    // Kept apart from calendarError, which fetchConnectedCalendar also sets —
    // including for "no calendar is linked", which is not a failed load.
    calendarListError: null,
    calendarReconnectRequired: false,
    linkingCalendar: false,
    assistantTools: [],
    fetchingAssistantTools: false,
    connectedCalendar: null,
    connectedCalendarFor: null, // the assistant `connectedCalendar` describes
    calendarLinked: null,      // null = not checked yet
    calendarMissing: false,
    fetchingConnectedCalendar: false,
    addingTool: false,
    toolError: null,
    sendingChat: false,
    chatError: null,
    callLogs: [],
    fetchingLogs: false,
    logsError: null,
    walletBalance: null,
    fetchingBalance: false,
    transactions: [],
    fetchingTransactions: false,
    transactionError: null,
    contacts: [],
    fetchingContacts: false,
    contactActionLoading: false,
    analytics: null,
    fetchingAnalytics: false,
    analyticsError: null,
    subAccountSpend: [],
    fetchingSubAccountSpend: false,
    subAccountSpendError: null,
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
    clearContactStatus: (state) => {
      state.contactActionLoading = false;
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
    clearTransactionHistory: (state) => {
      state.transactions = [];
      state.transactionError = null;
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
      .addCase(getAssistantById.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // One shared slot. Holding the last assistant while a different one
        // loads shows its voice, model and prompt under the new assistant —
        // and PromptEditor seeds an empty editor from whatever is in here.
        const wanted = action.meta.arg?.assistantId;
        const held = state.selectedAssistant;
        if (held && held.id !== wanted && held.assistantId !== wanted) {
          state.selectedAssistant = null;
        }
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

      .addCase(setAssistantMeta.fulfilled, (state, action) => {
        const { assistantId, favorite, archived } = action.payload;
        const a = state.data.find((x) => x.id === assistantId || x.assistantId === assistantId);
        if (a) {
          if (favorite !== undefined) a.favorite = favorite;
          if (archived !== undefined) a.archived = archived;
        }
        if (state.selectedAssistant && (state.selectedAssistant.id === assistantId)) {
          if (favorite !== undefined) state.selectedAssistant.favorite = favorite;
          if (archived !== undefined) state.selectedAssistant.archived = archived;
        }
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
        state.deletingKnowledgeBase = false;
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

      // unlink calendar from assistant
      .addCase(removeCalendarFromAssistant.pending, (state) => {
        state.linkingCalendar = true;
        state.calendarError = null;
      })
      .addCase(removeCalendarFromAssistant.fulfilled, (state, action) => {
        state.linkingCalendar = false;
        state.connectedCalendar = null;
        state.connectedCalendarFor = action.meta.arg?.assistantId ?? null;
        state.calendarLinked = false;
        state.calendarMissing = false;
        if (state.selectedAssistant) state.selectedAssistant.calendar = "";
      })
      .addCase(removeCalendarFromAssistant.rejected, (state, action) => {
        state.linkingCalendar = false;
        state.calendarError = action.payload;
      })

      // assistant tools (for toolkit "Added" state)
      .addCase(fetchAssistantTools.pending, (state) => {
        state.fetchingAssistantTools = true;
      })
      .addCase(fetchAssistantTools.fulfilled, (state, action) => {
        state.fetchingAssistantTools = false;
        state.assistantTools = action.payload;
      })
      .addCase(fetchAssistantTools.rejected, (state) => {
        state.fetchingAssistantTools = false;
        state.assistantTools = [];
      })
      .addCase(removeToolFromAssistant.fulfilled, (state, action) => {
        state.assistantTools = state.assistantTools.filter(
          (t) => t.id !== action.payload.toolId,
        );
      })

      //get ghl calendars
      .addCase(fetchGHLCalendars.pending, (state) => {
        state.fetchingCalendars = true;
        state.calendarError = null;
        state.calendarListError = null;
        state.calendarReconnectRequired = false;
      })
      .addCase(fetchGHLCalendars.fulfilled, (state, action) => {
        state.fetchingCalendars = false;
        state.availableCalendars = action.payload;
        state.calendarListError = null;
        state.calendarReconnectRequired = false;
      })
      .addCase(fetchGHLCalendars.rejected, (state, action) => {
        state.fetchingCalendars = false;
        // Otherwise the grid keeps rendering the calendars of whichever
        // sub-account was open last, and they are selectable.
        state.availableCalendars = [];
        state.calendarError = action.payload?.message || action.payload;
        state.calendarListError = action.payload?.message || action.payload;
        state.calendarReconnectRequired = !!action.payload?.reconnectRequired;
        state.calendarMissing = !!action.payload?.calendarMissing;
        state.calendarLinked = action.payload?.calendarLinked !== false;
      })

      // 🔹 Fetch Connected Calendar
      .addCase(fetchConnectedCalendar.pending, (state, action) => {
        state.fetchingConnectedCalendar = true;
        state.calendarError = null;
        state.calendarReconnectRequired = false;
        state.calendarMissing = false;
        state.calendarLinked = null;
        // The grid renders as soon as the calendar list lands, which can be
        // before this resolves — with the last assistant's calendar still here,
        // it badges the wrong card Connected. Re-checking the same assistant
        // keeps its answer, so linking one does not blink the badge off.
        if (state.connectedCalendarFor !== action.meta.arg?.assistantId) {
          state.connectedCalendar = null;
          state.connectedCalendarFor = null;
        }
      })
      .addCase(fetchConnectedCalendar.fulfilled, (state, action) => {
        state.fetchingConnectedCalendar = false;
        state.connectedCalendar = action.payload; // This stores the { calendarId, assistantId, ... } object
        state.connectedCalendarFor = action.meta.arg?.assistantId ?? null;
        state.calendarLinked = true;
        state.calendarMissing = false;
        state.calendarReconnectRequired = false;
      })
      .addCase(fetchConnectedCalendar.rejected, (state, action) => {
        state.fetchingConnectedCalendar = false;
        state.calendarError = action.payload?.message || action.payload;
        state.calendarReconnectRequired = !!action.payload?.reconnectRequired;

        // "No calendar is linked" comes back as a rejection, so leaving the
        // previously fetched calendar in place kept the card badged Connected
        // after it had been unlinked — and left the assistant audit reporting a
        // linked, reachable calendar that was not there.
        //
        // An object payload means the server answered and told us the state; a
        // string means the request itself failed, and a transport blip is no
        // reason to claim the calendar is gone.
        if (action.payload && typeof action.payload === "object") {
          state.connectedCalendar = null;
          state.connectedCalendarFor = action.meta.arg?.assistantId ?? null;
          state.calendarLinked = action.payload.calendarLinked !== false;
          state.calendarMissing = !!action.payload.calendarMissing;
        }
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
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.sendingChat = false;
        // The transcript is held by ChatLab, which restores it from the
        // assistant's customer memory via fetchChatHistory — there is no copy
        // of it in the store to keep in step.
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
        state.callLogs = Array.isArray(action.payload)
          ? [...action.payload]
          : [];
      })
      .addCase(getAssistantCallLogs.rejected, (state, action) => {
        state.fetchingLogs = false;
        state.logsError = action.payload;
      })

      //fetch wallet balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.fetchingBalance = true;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.fetchingBalance = false;
        state.walletBalance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state) => {
        state.fetchingBalance = false;
      })

      .addCase(generateOutboundCallUrl.pending, (state) => {
        state.loadingOutbound = true;
        state.outboundError = null;
      })
      .addCase(generateOutboundCallUrl.fulfilled, (state, action) => {
        state.loadingOutbound = false;
        // Store the specific generated URL in your state
        state.generatedOutboundUrl = action.payload;
      })
      .addCase(generateOutboundCallUrl.rejected, (state, action) => {
        state.loadingOutbound = false;
        state.outboundError = action.payload;
      })

      //fetch transaction history
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.fetchingTransactions = true;
        state.transactionError = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.fetchingTransactions = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.fetchingTransactions = false;
        state.transactionError = action.payload;
      })

      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.fetchingContacts = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.fetchingContacts = false;
        state.contacts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchContacts.rejected, (state) => {
        state.fetchingContacts = false;
      })

      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.contactActionLoading = true;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.contactActionLoading = false;
        state.contacts.unshift(action.payload);
      })
      .addCase(createContact.rejected, (state) => {
        state.contactActionLoading = false;
      })

      // Update Contact
      .addCase(updateContact.fulfilled, (state, action) => {
        state.contactActionLoading = false;
        const index = state.contacts.findIndex(
          (c) => c.id === action.payload.id,
        );
        if (index !== -1) state.contacts[index] = action.payload;
      })
      .addCase(updateContact.pending, (state) => {
        state.contactActionLoading = true;
      })
      .addCase(updateContact.rejected, (state) => {
        state.contactActionLoading = false;
      })

      // Delete Contact
      .addCase(deleteContact.fulfilled, (state, action) => {
        // Without this the flag stays true and the contact panel's Save button
        // is disabled and spinning until the page is reloaded.
        state.contactActionLoading = false;
        state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteContact.pending, (state) => {
        state.contactActionLoading = true;
      })
      .addCase(deleteContact.rejected, (state) => {
        state.contactActionLoading = false;
      })

      // 🔹 Delete Assistant
      .addCase(deleteAssistant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssistant.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;

        // Remove from the main list
        state.data = state.data.filter(
          (assistant) =>
            assistant.id !== deletedId && assistant.assistantId !== deletedId,
        );

        // If the deleted assistant was the one selected, clear it
        if (
          state.selectedAssistant?.id === deletedId ||
          state.selectedAssistant?.assistantId === deletedId
        ) {
          state.selectedAssistant = null;
        }
      })
      .addCase(deleteAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Assistant Analytics
      .addCase(getAssistantAnalytics.pending, (state) => {
        state.fetchingAnalytics = true;
        state.analyticsError = null;
      })
      .addCase(getAssistantAnalytics.fulfilled, (state, action) => {
        state.fetchingAnalytics = false;
        // Make sure to access the correct property if your API returns { status: true, data: [...] }
        state.analytics = action.payload.data || action.payload;
      })
      .addCase(getAssistantAnalytics.rejected, (state, action) => {
        state.fetchingAnalytics = false;
        state.analyticsError = action.payload;
      })

      // Sub-account spend breakdown
      .addCase(fetchSubAccountSpend.pending, (state) => {
        state.fetchingSubAccountSpend = true;
        state.subAccountSpendError = null;
      })
      .addCase(fetchSubAccountSpend.fulfilled, (state, action) => {
        state.fetchingSubAccountSpend = false;
        state.subAccountSpend = action.payload || [];
      })
      .addCase(fetchSubAccountSpend.rejected, (state, action) => {
        state.fetchingSubAccountSpend = false;
        state.subAccountSpendError = action.payload;
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
  clearContactStatus,
} = assistantsSlice.actions;

export default assistantsSlice.reducer;
