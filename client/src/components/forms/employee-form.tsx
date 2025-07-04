import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type InsertEmployee, type Route } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";

interface EmployeeFormProps {
  onSubmit: (data: InsertEmployee) => void;
  onCancel: () => void;
  defaultValues?: Partial<InsertEmployee>;
}

export function EmployeeForm({ onSubmit, onCancel, defaultValues }: EmployeeFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      shift: "morning",
      ...defaultValues,
    },
  });

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('employeeName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('fullNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('phonePlaceholder')} 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Адрес</FormLabel>
              <FormControl>
                <Input placeholder="Введите адрес" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="shift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Смена</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите смену" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="morning">Утренняя (7:00 - 19:00)</SelectItem>
                  <SelectItem value="evening">Вечерняя (19:00 - 7:00)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="routeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Маршрут (необязательно)</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))} defaultValue={field.value?.toString() || "none"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите маршрут" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {routes.map((route: any) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name} ({route.occupancy}/{route.capacity} мест)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="md:col-span-2 flex space-x-4">
          <Button type="submit">
            Добавить сотрудника
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
