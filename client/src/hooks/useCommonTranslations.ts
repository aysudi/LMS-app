// @ts-ignore
import { useTranslation } from "react-i18next";

export const useCommonTranslations = () => {
  const { t } = useTranslation();

  return {
    // Common Actions
    actions: {
      save: t("common.save"),
      delete: t("common.delete"),
      edit: t("common.edit"),
      create: t("common.create"),
      update: t("common.update"),
      cancel: t("common.cancel"),
      submit: t("common.submit"),
      back: t("common.back"),
      next: t("common.next"),
      previous: t("common.previous"),
      search: t("common.search"),
      filter: t("common.filter"),
      sort: t("common.sort"),
      loading: t("common.loading"),
    },

    // Status Messages
    status: {
      success: t("common.success"),
      error: t("common.error"),
      loading: t("common.loading"),
      published: t("common.published"),
      draft: t("common.draft"),
      pending: t("common.pending"),
      approved: t("common.approved"),
      rejected: t("common.rejected"),
      active: t("common.active"),
      inactive: t("common.inactive"),
    },

    // Course Related
    course: {
      courses: t("common.courses"),
      course: t("common.course"),
      title: t("course.title"),
      description: t("course.description"),
      enrollNow: t("course.enrollNow"),
      addToCart: t("course.addToCart"),
      addToWishlist: t("course.addToWishlist"),
      removeFromWishlist: t("course.removeFromWishlist"),
      courseContent: t("course.courseContent"),
      aboutInstructor: t("course.aboutInstructor"),
      studentReviews: t("course.studentReviews"),
    },

    // Navigation
    navigation: {
      dashboard: t("navigation.dashboard"),
      myCourses: t("navigation.myCourses"),
      browse: t("navigation.browse"),
      cart: t("navigation.cart"),
      wishlist: t("navigation.wishlist"),
      messages: t("navigation.messages"),
      notifications: t("navigation.notifications"),
      analytics: t("navigation.analytics"),
      earnings: t("navigation.earnings"),
      createCourse: t("navigation.createCourse"),
      students: t("navigation.students"),
      reviews: t("navigation.reviews"),
      settings: t("common.settings"),
    },

    // Auth Related
    auth: {
      login: t("auth.signIn"),
      register: t("auth.signUp"),
      logout: t("auth.signOut"),
      welcome: t("auth.welcome"),
      welcomeBack: t("auth.welcomeBack"),
      email: t("common.email"),
      password: t("common.password"),
      rememberMe: t("auth.rememberMe"),
      forgotPassword: t("auth.forgotPassword"),
      createAccount: t("auth.createAccount"),
      alreadyHaveAccount: t("auth.alreadyHaveAccount"),
      dontHaveAccount: t("auth.dontHaveAccount"),
    },

    // Student/Learning
    student: {
      myLearning: t("student.myLearning"),
      continueLearning: t("student.continueLearning"),
      completedCourses: t("student.completedCourses"),
      inProgressCourses: t("student.inProgressCourses"),
      wishlistedCourses: t("student.wishlistedCourses"),
      browseCategories: t("student.browseCategories"),
      featuredCourses: t("student.featuredCourses"),
      newCourses: t("student.newCourses"),
      popularCourses: t("student.popularCourses"),
      recommendedForYou: t("student.recommendedForYou"),
      cart: t("student.coursesInCart"),
      checkout: t("student.checkout"),
      progress: t("student.progress"),
      completed: t("student.completed"),
    },

    // Instructor
    instructor: {
      createNewCourse: t("instructor.createNewCourse"),
      editCourse: t("instructor.editCourseAction"),
      courseDashboard: t("instructor.courseDashboard"),
      myStudents: t("instructor.myStudents"),
      earnings: t("instructor.earnings"),
      performance: t("instructor.performance"),
      totalEarnings: t("instructor.totalEarnings"),
      totalStudents: t("instructor.totalStudents"),
      totalCourses: t("instructor.totalCourses"),
      averageRating: t("instructor.averageRating"),
      publishCourse: t("instructor.publishCourse"),
      unpublishCourse: t("instructor.unpublishCourse"),
    },

    // Filters
    filters: {
      filterBy: t("filters.filterBy"),
      clearFilters: t("filters.clearFilters"),
      priceRange: t("filters.priceRange"),
      courseLevel: t("filters.courseLevel"),
      courseRating: t("filters.courseRating"),
      sortBy: t("filters.sortBy"),
      relevance: t("filters.relevance"),
      mostPopular: t("filters.mostPopular"),
      highestRated: t("filters.highestRated"),
      newest: t("filters.newest"),
    },

    // Common Fields
    fields: {
      firstName: t("common.firstName"),
      lastName: t("common.lastName"),
      email: t("common.email"),
      phone: t("common.phone"),
      address: t("common.address"),
      city: t("common.city"),
      country: t("common.country"),
      price: t("common.price"),
      free: t("common.free"),
      paid: t("common.paid"),
      category: t("common.category"),
      categories: t("common.categories"),
      rating: t("common.rating"),
      reviews: t("common.reviews"),
      students: t("common.students"),
      instructor: t("common.instructor"),
      level: t("common.level"),
      beginner: t("common.beginner"),
      intermediate: t("common.intermediate"),
      advanced: t("common.advanced"),
      all: t("common.all"),
      duration: t("common.duration"),
    },

    // Error Messages
    errors: {
      somethingWentWrong: t("errors.somethingWentWrong"),
      pageNotFound: t("errors.pageNotFound"),
      accessDenied: t("errors.accessDenied"),
      networkError: t("errors.networkError"),
      serverError: t("errors.serverError"),
      tryAgain: t("errors.tryAgain"),
      contactSupport: t("errors.contactSupport"),
    },

    // Success Messages
    success: {
      operationSuccessful: t("success.operationSuccessful"),
      changesSaved: t("success.changesSaved"),
      profileUpdated: t("success.profileUpdated"),
    },

    // Messages
    messages: {
      inbox: t("messages.inbox"),
      sent: t("messages.sent"),
      compose: t("messages.compose"),
      newMessage: t("messages.newMessage"),
      sendMessage: t("messages.sendMessage"),
      recipient: t("messages.recipient"),
      subject: t("messages.subject"),
      message: t("messages.message"),
      noMessages: t("messages.noMessages"),
      searchMessages: t("messages.searchMessages"),
    },

    // Time & Date helpers
    time: {
      justNow: t("notifications.justNow"),
      minutesAgo: (count: number) => t("notifications.minutesAgo", { count }),
      hoursAgo: (count: number) => t("notifications.hoursAgo", { count }),
      daysAgo: (count: number) => t("notifications.daysAgo", { count }),
    },

    // Format helpers
    format: {
      courseCount: (count: number) =>
        count === 1 ? t("common.course") : t("common.courses"),
      studentCount: (count: number) =>
        count === 1 ? t("common.student") : t("common.students"),
      reviewCount: (count: number) =>
        count === 1 ? t("common.review") : t("common.reviews"),
    },
  };
};
