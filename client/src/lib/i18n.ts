import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'kk' | 'ru';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'kk' as Language,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const translations = {
  kk: {
    // Navigation
    dashboard: 'Басқару панелі',
    employees: 'Қызметкерлер',
    routes: 'Бағыттар',
    vehicles: 'Көлік парк',
    map: 'Карта',
    assignments: 'Тағайындаулар',
    reports: 'Есептер',
    
    // Dashboard
    totalEmployees: 'Барлық қызметкерлер',
    activeRoutes: 'Белсенді бағыттар',
    totalVehicles: 'Көлік құралдары',
    efficiency: 'Тиімділік',
    perMonth: 'айына',
    newRoutes: 'жаңа бағыт',
    utilization: 'жүктеме',
    
    // Forms
    employeeName: 'Қызметкер аты-жөні',
    fullNamePlaceholder: 'Толық аты-жөнін енгізіңіз',
    phone: 'Телефон',
    phonePlaceholder: 'Телефон нөмірін енгізіңіз',
    address: 'Мекенжай',
    addressPlaceholder: 'Толық мекенжайды енгізіңіз',
    shift: 'Ауысым',
    selectShift: 'Ауысымды таңдаңыз',
    morningShift: 'Таңертеңгі (7:00 - 19:00)',
    eveningShift: 'Кешкі (19:00 - 7:00)',
    route: 'Бағыт',
    selectRoute: 'Бағытты таңдаңыз',
    notAssigned: 'Тағайындалмаған',
    
    // Actions
    save: 'Сақтау',
    cancel: 'Болдырмау',
    add: 'Қосу',
    edit: 'Өзгерту',
    delete: 'Жою',
    assign: 'Тағайындау',
    
    // Shifts
    morning: 'Таңертеңгі',
    evening: 'Кешкі',
    
    // Status
    active: 'Белсенді',
    inactive: 'Белсенді емес',
    maintenance: 'Жөндеу',
    
    // Roles
    admin: 'Әкімші',
    fullAccess: 'Толық құқық',
    
    // App name
    appName: 'BusManager',
    appDescription: 'Қызметкер көлігін басқару',
  },
  ru: {
    // Navigation
    dashboard: 'Панель управления',
    employees: 'Сотрудники',
    routes: 'Маршруты',
    vehicles: 'Транспорт',
    map: 'Карта',
    assignments: 'Назначения',
    reports: 'Отчеты',
    
    // Dashboard
    totalEmployees: 'Всего сотрудников',
    activeRoutes: 'Активных маршрутов',
    totalVehicles: 'Транспортных средств',
    efficiency: 'Эффективность',
    perMonth: 'за месяц',
    newRoutes: 'новых маршрута',
    utilization: 'загруженность',
    
    // Forms
    employeeName: 'Имя сотрудника',
    fullNamePlaceholder: 'Введите полное имя',
    phone: 'Телефон',
    phonePlaceholder: 'Введите номер телефона',
    address: 'Адрес',
    addressPlaceholder: 'Введите полный адрес',
    shift: 'Смена',
    selectShift: 'Выберите смену',
    morningShift: 'Утренняя (7:00 - 19:00)',
    eveningShift: 'Вечерняя (19:00 - 7:00)',
    route: 'Маршрут',
    selectRoute: 'Выберите маршрут',
    notAssigned: 'Не назначен',
    
    // Actions
    save: 'Сохранить',
    cancel: 'Отмена',
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    assign: 'Назначить',
    
    // Shifts
    morning: 'Утренняя',
    evening: 'Вечерняя',
    
    // Status
    active: 'Активный',
    inactive: 'Неактивный',
    maintenance: 'Обслуживание',
    
    // Roles
    admin: 'Администратор',
    fullAccess: 'Полные права',
    
    // App name
    appName: 'BusManager',
    appDescription: 'Управление корпоративным транспортом',
  }
};

export const useTranslation = () => {
  const { language } = useLanguageStore();
  
  const t = (key: keyof typeof translations.kk): string => {
    return translations[language][key] || key;
  };
  
  return { t, language };
};