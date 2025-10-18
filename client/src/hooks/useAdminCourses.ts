import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminService from "../services/admin.service";
import { toast } from "react-hot-toast";

export const useAdminCourses = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ["admin", "courses", params],
    queryFn: () => adminService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminCourseDetails = (courseId: string) => {
  return useQuery({
    queryKey: ["admin", "course-details", courseId],
    queryFn: () => adminService.getCourseDetails(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!courseId,
  });
};

export const useApproveCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      feedback,
    }: {
      courseId: string;
      feedback?: string;
    }) => adminService.approveCourse(courseId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve course");
    },
  });
};

export const useRejectCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      rejectionReason,
      adminFeedback,
    }: {
      courseId: string;
      rejectionReason: string;
      adminFeedback?: string;
    }) => adminService.rejectCourse(courseId, rejectionReason, adminFeedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course rejected successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject course");
    },
  });
};
