import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import type { Lecture } from "@/lib/attendwise-types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export type ReminderResult =
  | { status: "scheduled"; count: number }
  | { status: "permission-denied"; count: 0 }
  | { status: "unsupported"; count: 0 };

function nextDateForWeekday(day: string, weekOffset: number) {
  const now = new Date();
  const offset = (WEEKDAY_INDEX[day] - now.getDay() + 7) % 7 + weekOffset * 7;
  const date = new Date(now);
  date.setDate(now.getDate() + offset);
  return date;
}

function dateAtTime(date: Date, time: string, reminderMinutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const reminder = new Date(date);
  reminder.setHours(hour, minute - reminderMinutes, 0, 0);
  return reminder;
}

export async function scheduleLectureReminders(
  lectures: Lecture[],
  reminderMinutes: number,
): Promise<ReminderResult> {
  if (Platform.OS === "web") return { status: "unsupported", count: 0 };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lectures", {
      name: "Lecture reminders",
      description: "Upcoming GNDEC ITB lecture alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 80, 150],
      lightColor: "#2446A8",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { status: "permission-denied", count: 0 };

  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  let count = 0;

  for (const lecture of lectures) {
    for (const weekOffset of [0, 1]) {
      const triggerDate = dateAtTime(nextDateForWeekday(lecture.day, weekOffset), lecture.startTime, reminderMinutes);
      if (triggerDate <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${lecture.subject} in ${reminderMinutes} minutes`,
          body: `${lecture.startTime}–${lecture.endTime} · ${lecture.classroom}`,
          data: { lectureId: lecture.id, screen: "/timetable" },
          ...(Platform.OS === "android" ? { color: "#2446A8" } : {}),
        },
        trigger: Platform.OS === "android"
          ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate, channelId: "lectures" }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
      });
      count += 1;
    }
  }

  return { status: "scheduled", count };
}
