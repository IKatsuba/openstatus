import { db, eq, schema } from "@openstatus/db";
import type {
  MonitorFlyRegion,
  MonitorStatus,
} from "@openstatus/db/src/schema";
import {
  selectMonitorSchema,
  selectNotificationSchema,
} from "@openstatus/db/src/schema";

import { checkerAudit } from "../utils/audit-log";
import { providerToFunction } from "./utils";

export const triggerNotifications = async ({
  monitorId,
  statusCode,
  message,
  notifType,
  incidentId,
}: {
  monitorId: string;
  statusCode?: number;
  message?: string;
  notifType: "alert" | "recovery" | "degraded";
  incidentId?: string;
}) => {
  console.log(`💌 triggerAlerting for ${monitorId}`);
  const notifications = await db
    .select()
    .from(schema.notificationsToMonitors)
    .innerJoin(
      schema.notification,
      eq(schema.notification.id, schema.notificationsToMonitors.notificationId),
    )
    .innerJoin(
      schema.monitor,
      eq(schema.monitor.id, schema.notificationsToMonitors.monitorId),
    )
    .where(eq(schema.monitor.id, Number(monitorId)))
    .all();
  for (const notif of notifications) {
    console.log(
      `💌 sending notification for ${monitorId} and chanel ${notif.notification.provider} for ${notifType}`,
    );
    const monitor = selectMonitorSchema.parse(notif.monitor);
    switch (notifType) {
      case "alert":
        await providerToFunction[notif.notification.provider].sendAlert({
          monitor,
          notification: selectNotificationSchema.parse(notif.notification),
          statusCode,
          message,
          incidentId,
        });
        break;
      case "recovery":
        await providerToFunction[notif.notification.provider].sendRecovery({
          monitor,
          notification: selectNotificationSchema.parse(notif.notification),
          statusCode,
          message,
          incidentId,
        });
        break;
      case "degraded":
        await providerToFunction[notif.notification.provider].sendDegraded({
          monitor,
          notification: selectNotificationSchema.parse(notif.notification),
          statusCode,
          message,
        });
        break;
    }
    // ALPHA
    await checkerAudit.publishAuditLog({
      id: `monitor:${monitorId}`,
      action: "notification.sent",
      targets: [{ id: monitorId, type: "monitor" }],
      metadata: { provider: notif.notification.provider },
    });
    //
  }
};

export const upsertMonitorStatus = async ({
  monitorId,
  status,
  region,
}: {
  monitorId: string;
  status: MonitorStatus;
  region: MonitorFlyRegion;
}) => {
  const newData = await db
    .insert(schema.monitorStatusTable)
    .values({ status, region, monitorId: Number(monitorId) })
    .onConflictDoUpdate({
      target: [
        schema.monitorStatusTable.monitorId,
        schema.monitorStatusTable.region,
      ],
      set: { status, updatedAt: new Date() },
    })
    .returning();
  console.log(`📈 upsertMonitorStatus for ${monitorId} in region ${region}`);
  console.log(`🤔 upsert monitor ${JSON.stringify(newData)}`);
};
