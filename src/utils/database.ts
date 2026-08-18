import { supabase } from "./supabase";
import type { Session, AttendanceRecord } from "./helpers";

function formatDbError(scope: string, error: { message?: string; code?: string; hint?: string }): string {
  const code = error.code ? ` [${error.code}]` : "";
  const hint = error.hint ? ` — ${error.hint}` : "";
  return `${scope}${code}: ${error.message || "Unknown error"}${hint}`;
}

export interface AttendanceData {
  id: string;
  session_name: string;
  recorded_by: string;
  recorded_at: string;
  records: AttendanceRecord[];
  created_at: string;
}

export interface StudentStatistic {
  id: string;
  student_name: string;
  total_sessions: number;
  present_count: number;
  absent_excused_count: number;
  absent_unexcused_count: number;
  attendance_rate: number;
  recorded_by: string;
  updated_at: string;
}

export interface AttendanceHistory {
  id: string;
  session_id: string;
  session_name: string;
  recorded_by: string;
  recorded_at: string;
  total_students: number;
  present_count: number;
  absent_excused_count: number;
  absent_unexcused_count: number;
  created_at: string;
}

/**
 * Save attendance session to Supabase.
 * Nếu session đã có remoteId (đã lưu trước đó) thì UPDATE bản ghi cũ
 * thay vì INSERT mới → tránh trùng lặp dữ liệu khi bấm Lưu nhiều lần.
 */
export async function saveAttendanceToDatabase(
  session: Session,
  recordedBy: string
): Promise<{ success: boolean; error?: string; data?: AttendanceData }> {
  try {
    const attendanceData: Omit<AttendanceData, "id" | "created_at"> & {
      id?: string;
    } = {
      session_name: session.name,
      recorded_by: recordedBy,
      recorded_at: new Date(session.savedAt || Date.now()).toISOString(),
      records: session.records,
    };
    if (session.remoteId) {
      attendanceData.id = session.remoteId;
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .upsert(attendanceData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: formatDbError("Lỗi lưu dữ liệu", error),
      };
    }

    return {
      success: true,
      data: data as AttendanceData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Fetch all attendance records
 */
export async function fetchAttendanceRecords(): Promise<{
  success: boolean;
  error?: string;
  data?: AttendanceData[];
}> {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: `Lỗi tải dữ liệu: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as AttendanceData[],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Fetch attendance records by user
 */
export async function fetchUserAttendanceRecords(
  recordedBy: string
): Promise<{ success: boolean; error?: string; data?: AttendanceData[] }> {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("recorded_by", recordedBy)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: `Lỗi tải dữ liệu: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as AttendanceData[],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Save student statistics to Supabase
 */
export async function saveStudentStatistics(
  statistics: Omit<StudentStatistic, "id" | "updated_at">[]
): Promise<{ success: boolean; error?: string; data?: StudentStatistic[] }> {
  try {
    const statsWithTimestamp = statistics.map((stat) => ({
      ...stat,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("student_statistics")
      .upsert(statsWithTimestamp, { onConflict: "student_name" })
      .select();

    if (error) {
      return {
        success: false,
        error: formatDbError("Lỗi lưu thống kê", error),
      };
    }

    return {
      success: true,
      data: data as StudentStatistic[],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Fetch student statistics
 */
export async function fetchStudentStatistics(
  recordedBy?: string
): Promise<{ success: boolean; error?: string; data?: StudentStatistic[] }> {
  try {
    let query = supabase.from("student_statistics").select("*");

    if (recordedBy) {
      query = query.eq("recorded_by", recordedBy);
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      return {
        success: false,
        error: `Lỗi tải thống kê: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as StudentStatistic[],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Save attendance history to Supabase.
 * Xóa dòng history cũ của session (nếu có) rồi insert lại →
 * mỗi phiên chỉ có đúng 1 dòng lịch sử khi bấm Lưu nhiều lần.
 */
export async function saveAttendanceHistory(
  session: Session,
  recordedBy: string
): Promise<{ success: boolean; error?: string; data?: AttendanceHistory }> {
  try {
    const presentCount = session.records.filter(
      (r) => r.status === "present"
    ).length;
    const absentExcusedCount = session.records.filter(
      (r) => r.status === "absent-excused"
    ).length;
    const absentUnexcusedCount = session.records.filter(
      (r) => r.status === "absent-unexcused"
    ).length;

    // Luôn dùng remoteId làm session_id nếu có (ổn định khi sync giữa các máy)
    const stableSessionId = session.remoteId || session.id;

    // Xóa history cũ theo mọi id có thể của phiên này (local id hoặc remoteId)
    const possibleIds = [session.id];
    if (session.remoteId && session.remoteId !== session.id) {
      possibleIds.push(session.remoteId);
    }
    const { error: delError } = await supabase
      .from("attendance_history")
      .delete()
      .in("session_id", possibleIds);
    if (delError) {
      return {
        success: false,
        error: formatDbError("Lỗi cập nhật lịch sử", delError),
      };
    }

    const historyData = {
      session_id: stableSessionId,
      session_name: session.name,
      recorded_by: recordedBy,
      recorded_at: new Date(session.savedAt || Date.now()).toISOString(),
      total_students: session.records.length,
      present_count: presentCount,
      absent_excused_count: absentExcusedCount,
      absent_unexcused_count: absentUnexcusedCount,
    };

    const { data, error } = await supabase
      .from("attendance_history")
      .insert([historyData])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: formatDbError("Lỗi lưu lịch sử", error),
      };
    }

    return {
      success: true,
      data: data as AttendanceHistory,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Fetch attendance history
 */
export async function fetchAttendanceHistory(
  recordedBy?: string
): Promise<{ success: boolean; error?: string; data?: AttendanceHistory[] }> {
  try {
    let query = supabase.from("attendance_history").select("*");

    if (recordedBy) {
      query = query.eq("recorded_by", recordedBy);
    }

    const { data, error } = await query.order("recorded_at", {
      ascending: false,
    });

    if (error) {
      return {
        success: false,
        error: `Lỗi tải lịch sử: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as AttendanceHistory[],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Delete attendance record by ID
 */
export async function deleteAttendanceRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("id", recordId);

    if (error) {
      return {
        success: false,
        error: `Lỗi xóa dữ liệu: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Delete attendance history by ID
 */
export async function deleteAttendanceHistory(
  historyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendance_history")
      .delete()
      .eq("id", historyId);

    if (error) {
      return {
        success: false,
        error: `Lỗi xóa lịch sử: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Delete all attendance data for testing (admin only)
 */
export async function deleteAllAttendanceData(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Delete all records from all tables
    // Lưu ý: không dùng .neq("id", "null") với cột UUID — PostgREST
    // sẽ báo lỗi 22P02 (invalid input syntax for type uuid).
    const [attendanceError, historyError, statsError] = await Promise.all([
      supabase.from("attendance_records").delete().not("id", "is", null).then((r) => r.error),
      supabase.from("attendance_history").delete().not("id", "is", null).then((r) => r.error),
      supabase.from("student_statistics").delete().not("id", "is", null).then((r) => r.error),
    ]);

    if (attendanceError || historyError || statsError) {
      const errors = [
        attendanceError?.message,
        historyError?.message,
        statsError?.message,
      ]
        .filter(Boolean)
        .join("; ");
      return {
        success: false,
        error: `Lỗi xóa dữ liệu: ${errors}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Delete attendance data by user (cán bộ lớp)
 */
export async function deleteAttendanceDataByUser(
  recordedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [attendanceError, historyError, statsError] = await Promise.all([
      supabase
        .from("attendance_records")
        .delete()
        .eq("recorded_by", recordedBy)
        .then((r) => r.error),
      supabase
        .from("attendance_history")
        .delete()
        .eq("recorded_by", recordedBy)
        .then((r) => r.error),
      supabase
        .from("student_statistics")
        .delete()
        .not("id", "is", null)
        .then((r) => r.error),
    ]);

    if (attendanceError || historyError || statsError) {
      const errors = [
        attendanceError?.message,
        historyError?.message,
        statsError?.message,
      ]
        .filter(Boolean)
        .join("; ");
      return {
        success: false,
        error: `Lỗi xóa dữ liệu: ${errors}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}

/**
 * Sync sessions from Supabase - tải phiên điểm danh của TẤT CẢ cán bộ lớp
 * và chuyển thành Session local (kèm tên người thực hiện).
 */
export async function syncSessionsFromDatabase(): Promise<{
  success: boolean;
  error?: string;
  data?: Session[];
}> {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: `Lỗi đồng bộ dữ liệu: ${error.message}`,
      };
    }

    const sessions: Session[] = (data as AttendanceData[]).map((row) => ({
      id: row.id,
      remoteId: row.id,
      name: row.session_name,
      createdAt: new Date(row.recorded_at).getTime(),
      savedAt: new Date(row.recorded_at).getTime(),
      records: Array.isArray(row.records) ? row.records : [],
      recordedBy: row.recorded_by,
    }));

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Lỗi: ${message}`,
    };
  }
}
