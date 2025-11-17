// src/workers/automationWorker.ts
import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { supabaseAdmin } from "../supabase/client";
import { publishDeviceAction } from "../device/bridge";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

const automationQueue = new Queue("automations", { connection });

export async function enqueueAutomation(automationId: string) {
  await automationQueue.add("run_automation", { automationId }, { removeOnComplete: true, removeOnFail: true });
}

// worker processor
export async function startWorkers() {
  const worker = new Worker(
    "automations",
    async (job) => {
      const { automationId } = job.data;
      // fetch automation
      const { data: automation } = await supabaseAdmin.from("automations").select("*").eq("id", automationId).single();
      if (!automation) throw new Error("Automation not found");

      // only support device action for now
      if (automation.action?.type === "device") {
        const { device_id, command, topic } = automation.action;
        // if a topic is provided use it; otherwise use default convention
        const deviceTopic = topic || `ochiga/estate/${automation.estate_id}/device/${device_id}/set`;
        publishDeviceAction(deviceTopic, command);
        // log event
        await supabaseAdmin.from("device_events").insert([{ device_id, user_id: automation.created_by, action: "automation_run", params: command }]);
      } else {
        console.warn("Unsupported automation action type", automation.action?.type);
      }
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log("Automation job completed", job.id);
  });
  worker.on("failed", (job, err) => {
    console.error("Automation job failed", job?.id, err);
  });

  return worker;
}

export { enqueueAutomation };
