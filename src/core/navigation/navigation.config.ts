export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  iconPath: string;
  iconCircle?: boolean;
}

export interface HeaderBreadcrumb {
  label: string;
  path: string;
}

interface HeaderActionBase {
  id: string;
  label: string;
  variant: "primary" | "outline";
  icon: "plus" | "warehouse" | "save";
}

export type HeaderAction =
  | (HeaderActionBase & {
      type: "link";
      path: string;
    })
  | (HeaderActionBase & {
      type: "submit";
      formId: string;
    });

export const navigation = {
  home: {
    id: "home",
    label: "الرئيسية",
    path: "/",
    iconPath: "M4 11.5 12 5l8 6.5M6.5 10v9h11v-9",
  },
  projects: {
    id: "projects",
    label: "المشاريع",
    path: "/projects",
    iconPath: "M4 3.5h10v17H4zM14 9h5v11.5h-5M7 7.5h1.5M7 11h1.5M7 14.5h1.5",
  },
  warehouse: {
    id: "warehouse",
    label: "المخزن الرئيسي",
    path: "/warehouse",
    iconPath: "M12 3.5 20 8v8l-8 4.5L4 16V8zM4 8l8 4.5L20 8M12 12.5v8",
  },
  team: {
    id: "team",
    label: "الفريق",
    path: "/team",
    iconPath:
      "M9 4.8a3.2 3.2 0 1 0 .01 0M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M15.5 5.2a3 3 0 0 1 0 5.6M17 14.3c1.9.6 3.1 2.2 3.5 4.7",
  },
  reports: {
    id: "reports",
    label: "التقارير",
    path: "/reports",
    iconPath: "M5 20V10M10 20V4M15 20v-7M20 20v-4",
  },
  settings: {
    id: "settings",
    label: "الإعدادات",
    path: "/settings",
    iconPath:
      "M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8",
    iconCircle: true,
  },
  more: {
    id: "more",
    label: "المزيد",
    path: "/more",
    iconPath:
      "M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z",
  },
  notifications: {
    id: "notifications",
    label: "التنبيهات",
    path: "/notifications",
    iconPath: "M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4",
  },
} satisfies Record<string, NavigationItem>;

export const sidebarItems: NavigationItem[] = [
  navigation.home,
  navigation.projects,
  navigation.warehouse,
  navigation.team,
  navigation.reports,
];

export const mobileItems: NavigationItem[] = [
  navigation.home,
  navigation.projects,
  navigation.team,
  navigation.reports,
  navigation.more,
];

export const pendingPages: NavigationItem[] = [
  navigation.home,
  navigation.warehouse,
  navigation.team,
  navigation.reports,
  navigation.settings,
  navigation.more,
  navigation.notifications,
];

const additionalPageTitles: Record<string, string> = {
  "/projects/new": "مشروع جديد",
  "/projects/archive": "أرشيف المشاريع",
  "/approvals": "الاعتمادات",
  "/blockers": "العوائق",
  "/planning": "الخطة الزمنية",
  "/handover": "التسليم",
  "/custody": "العُهد",
  "/materials": "المواد",
  "/plans/approve": "اعتماد الخطة",
};

const headerActionsByRoute: Record<string, HeaderAction[]> = {
  "/projects": [
    {
      id: "warehouse",
      label: "المخزن الرئيسي",
      type: "link",
      path: "/warehouse",
      variant: "outline",
      icon: "warehouse",
    },
    {
      id: "new-project",
      label: "مشروع جديد",
      type: "link",
      path: "/projects/new",
      variant: "primary",
      icon: "plus",
    },
  ],

  "/projects/new": [
    {
      id: "save-draft",
      label: "حفظ كمسودة",
      type: "submit",
      formId: "sarh-create-project-form",
      variant: "outline",
      icon: "save",
    },
  ],
};

const headerBreadcrumbsByRoute: Record<string, HeaderBreadcrumb[]> = {
  "/projects/new": [
    {
      label: "المشاريع",
      path: "/projects",
    },
  ],
};

export function getNavigationTitle(pathname: string): string {
  const exactPage = Object.values(navigation).find(
    (item) => item.path === pathname,
  );

  if (exactPage) {
    return exactPage.label;
  }

  if (additionalPageTitles[pathname]) {
    return additionalPageTitles[pathname];
  }

  if (pathname.startsWith("/projects/")) {
    return "تفاصيل المشروع";
  }

  return "صفحة غير موجودة";
}

export function getHeaderActions(pathname: string): HeaderAction[] {
  return headerActionsByRoute[pathname] ?? [];
}

export function getHeaderBreadcrumbs(pathname: string): HeaderBreadcrumb[] {
  return headerBreadcrumbsByRoute[pathname] ?? [];
}
