/**
 * Re-export all API services from a single entry point.
 */

export { apiClient } from './client';
export { authService } from './auth.service';
export { quizService } from './quiz.service';
export { currentAffairsService } from './currentAffairs.service';
export { userService } from './user.service';
export { reportService } from './report.service';
export type { ReportPayload, ReportReason } from './report.service';
