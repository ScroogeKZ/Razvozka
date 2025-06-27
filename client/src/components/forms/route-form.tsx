import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRouteSchema, type InsertRoute } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface RouteFormProps {
  onSubmit: (data: InsertRoute) => void;
  onCancel: () => void;
  defaultValues?: Partial<InsertRoute>;
}

export function RouteForm({ onSubmit, onCancel, defaultValues }: RouteFormProps) {
  const form = useForm<InsertRoute>({
    resolver: zodResolver(insertRouteSchema),
    defaultValues: {
      name: "",
      driver: "",
      capacity: 15,
      departureTime: "07:30",
      stops: [""],
      isActive: true,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название маршрута</FormLabel>
                <FormControl>
                  <Input placeholder="Например: Центральный район" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="driver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Водитель</FormLabel>
                <FormControl>
                  <Input placeholder="ФИО водителя" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Вместимость</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Количество мест" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Время отправления</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Остановки маршрута</FormLabel>
          <div className="space-y-3 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <FormField
                  control={form.control}
                  name={`stops.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Адрес остановки" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() => append("")}
              className="flex items-center space-x-2 text-primary hover:text-blue-600"
            >
              <Plus size={16} />
              <span>Добавить остановку</span>
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button type="submit">
            Создать маршрут
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
