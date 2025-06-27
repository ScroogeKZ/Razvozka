import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface VehicleFormProps {
  onSubmit: (data: InsertVehicle) => void;
  onCancel: () => void;
  defaultValues?: Partial<InsertVehicle>;
}

export function VehicleForm({ onSubmit, onCancel, defaultValues }: VehicleFormProps) {
  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      licensePlate: "",
      model: "",
      capacity: 15,
      status: "active",
      notes: "",
      ...defaultValues,
    },
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Государственный номер</FormLabel>
              <FormControl>
                <Input placeholder="А123БВ199" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Марка и модель</FormLabel>
              <FormControl>
                <Input placeholder="Mercedes-Benz Sprinter" {...field} />
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
          name="routeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Назначенный маршрут</FormLabel>
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
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Дополнительная информация</FormLabel>
              <FormControl>
                <Textarea placeholder="Особенности, состояние и т.д." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="md:col-span-2 flex space-x-4">
          <Button type="submit">
            Добавить транспорт
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
