import { invoke } from "@tauri-apps/api/tauri";



export const processWorklog = async (entries: string[]): Promise<void> => {
  try {
    await invoke("process_worklog", { entries });
  } catch (error) {
    console.error("Error processing worklog:", error);
    throw error;
  }
};

export const readWorklog = async (): Promise<string> => {
  try {
    return await invoke("read_worklog");
  } catch (error) {
    console.error("Error reading worklog:", error);
    throw error;
  }
};

export const undoLastChange = async (): Promise<void> => {
  try {
    await invoke("undo_last_change");
  } catch (error) {
    console.error("Error undoing last change:", error);
    throw error;
  }
};

export const generateSummaryReport = async (
  startDate: string,
  endDate: string,
  reportStyle: string
): Promise<string> => {
  try {
    return await invoke("generate_summary_report", {
      startDate,
      endDate,
      reportStyle
    });
  } catch (error) {
    console.error("Error generating summary report:", error);
    throw error;
  }
};


// Secure API key management functions
export const saveOpenAIKey = async (apiKey: string): Promise<void> => {
  try {
    await invoke("save_openai_key", { apiKey });
  } catch (error) {
    console.error("Error saving OpenAI key:", error);
    throw error;
  }
};

export const getOpenAIKeyStatus = async (): Promise<boolean> => {
  try {
    return await invoke("get_openai_key_status");
  } catch (error) {
    console.error("Error checking OpenAI key status:", error);
    return false;
  }
};

export const deleteOpenAIKey = async (): Promise<void> => {
  try {
    await invoke("delete_openai_key");
  } catch (error) {
    console.error("Error deleting OpenAI key:", error);
    throw error;
  }
};