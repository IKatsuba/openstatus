import "dotenv/config";

import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "../env";
import {
  incidentTable,
  monitor,
  monitorsToPages,
  monitorsToStatusReport,
  notification,
  notificationsToMonitors,
  page,
  pagesToStatusReports,
  statusReport,
  statusReportUpdate,
  user,
  usersToWorkspaces,
  workspace,
} from "./schema";

async function main() {
  const db = drizzle(
    createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
  );
  console.log("Seeding database ");
  await db
    .insert(workspace)
    .values([
      {
        id: 1,
        slug: "love-openstatus",
        stripeId: "stripeId1",
        name: "test",
        subscriptionId: "subscriptionId",
        plan: "pro",
        endsAt: null,
        paidUntil: null,
      },
      {
        id: 2,
        slug: "test2",
        stripeId: "stripeId2",
        name: "test2",
        subscriptionId: "subscriptionId2",
        plan: "free",
        endsAt: null,
        paidUntil: null,
      },
    ])
    .run();

  await db
    .insert(monitor)
    .values([
      {
        id: 1,
        workspaceId: 1,
        active: true,
        url: "https://www.openstatus.dev",
        name: "OpenStatus",
        description: "OpenStatus website",
        method: "POST",
        periodicity: "1m",
        regions: "ams",
        headers: '[{"key":"key", "value":"value"}]',
        body: '{"hello":"world"}',
      },
      {
        id: 2,
        active: false,
        workspaceId: 1,
        periodicity: "10m",
        url: "https://www.google.com",
        method: "GET",
        regions: "gru",
        public: true,
      },
      {
        id: 3,
        workspaceId: 1,
        active: true,
        url: "https://www.openstatus.dev",
        name: "OpenStatus",
        description: "OpenStatus website",
        method: "GET",
        periodicity: "1m",
        regions: "ams",
        headers: '[{"key":"key", "value":"value"}]',
        body: '{"hello":"world"}',
      },
    ])
    .run();

  await db
    .insert(page)
    .values({
      id: 1,
      workspaceId: 1,
      title: "Test Page",
      description: "hello",
      icon: "https://www.openstatus.dev/favicon.ico",
      slug: "status",
      customDomain: "",
      published: true,
    })
    .run();

  await db
    .insert(user)
    .values({
      id: 1,
      tenantId: "1",
      firstName: "Speed",
      lastName: "Matters",
      email: "ping@openstatus.dev",
      photoUrl: "",
    })
    .run();
  await db
    .insert(usersToWorkspaces)
    .values({ workspaceId: 1, userId: 1 })
    .run();

  await db.insert(monitorsToPages).values({ monitorId: 1, pageId: 1 }).run();
  await db
    .insert(notification)
    .values({
      id: 1,
      provider: "email",
      name: "sample test notification",
      data: '{"email":"ping@openstatus.dev"}',
      workspaceId: 1,
    })
    .run();
  await db
    .insert(notificationsToMonitors)
    .values({ monitorId: 1, notificationId: 1 })
    .run();

  await db
    .insert(statusReport)
    .values({
      id: 1,
      workspaceId: 1,
      title: "Test Status Report",
      status: "investigating",
      updatedAt: new Date(),
    })
    .run();

  await db
    .insert(statusReportUpdate)
    .values({
      id: 1,
      statusReportId: 1,
      status: "investigating",
      message: "Message",
      date: new Date(),
    })
    .run();

  await db
    .insert(statusReport)
    .values({
      id: 2,
      workspaceId: 1,
      title: "Test Status Report",
      status: "investigating",
      updatedAt: new Date(),
    })
    .run();

  await db
    .insert(statusReportUpdate)
    .values({
      id: 2,
      statusReportId: 2,
      status: "investigating",
      message: "Message",
      date: new Date(),
    })
    .run();

  await db.insert(monitorsToStatusReport).values([
    {
      monitorId: 1,
      statusReportId: 2,
    },
    {
      monitorId: 2,
      statusReportId: 2,
    },
  ]);

  await db.insert(pagesToStatusReports).values([
    {
      pageId: 1,
      statusReportId: 2,
    },
    {
      pageId: 1,
      statusReportId: 1,
    },
  ]);

  await db
    .insert(incidentTable)
    .values({
      id: 1,
      workspaceId: 1,
      monitorId: 1,
      createdAt: new Date(),
      startedAt: new Date(),
    })
    .run();

  await db
    .insert(incidentTable)
    .values({
      id: 2,
      workspaceId: 1,
      monitorId: 1,
      createdAt: new Date(),
      startedAt: new Date(Date.now() + 1000),
    })
    .run();
  // on status update
  await db
    .update(statusReport)
    .set({ status: "monitoring" })
    .where(eq(statusReport.id, 1));
  await db
    .insert(statusReportUpdate)
    .values({
      id: 3,
      statusReportId: 1,
      status: "monitoring",
      message: "test",
      date: new Date(),
    })
    .run();
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed");
  console.error(e);
  process.exit(1);
});
