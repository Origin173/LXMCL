import { invoke } from "@tauri-apps/api/core";
import { TaskParam } from "@/models/download";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

export class DownloadTaskService {
  @responseHandler("download")
  static async schedule_progressive_task_group(
    task_group: string,
    params: TaskParam[]
  ): Promise<
    InvokeResponse<{
      task_ids: Number[];
      task_group: String;
    }>
  > {
    return await invoke("schedule_progressive_task_group", {
      taskGroup: task_group,
      params: params,
    });
  }
}
