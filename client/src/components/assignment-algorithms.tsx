import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Info } from "lucide-react";

export function AssignmentAlgorithms() {
  const [proximityWeight, setProximityWeight] = useState([70]);
  const [capacityWeight, setCapacityWeight] = useState([85]);
  const [shiftWeight, setShiftWeight] = useState([95]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoAssignMutation = useMutation({
    mutationFn: async (options: { proximityWeight: number; capacityWeight: number; shiftWeight: number }) => {
      const response = await apiRequest("POST", "/api/assignments/auto", options);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Автораспределение выполнено",
        description: `Назначено ${data.length} сотрудников`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить автораспределение",
        variant: "destructive",
      });
    },
  });

  const handleAutoAssign = () => {
    autoAssignMutation.mutate({
      proximityWeight: proximityWeight[0],
      capacityWeight: capacityWeight[0],
      shiftWeight: shiftWeight[0],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 size={20} />
          <span>Автоматическое распределение</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <h5 className="font-medium text-slate-800 mb-2">Приоритет по близости</h5>
            <div className="space-y-3">
              <Slider
                value={proximityWeight}
                onValueChange={setProximityWeight}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>0%</span>
                <span className="font-medium">{proximityWeight[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-lg p-4">
            <h5 className="font-medium text-slate-800 mb-2">Учет вместимости</h5>
            <div className="space-y-3">
              <Slider
                value={capacityWeight}
                onValueChange={setCapacityWeight}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>0%</span>
                <span className="font-medium">{capacityWeight[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-lg p-4">
            <h5 className="font-medium text-slate-800 mb-2">Учет смен</h5>
            <div className="space-y-3">
              <Slider
                value={shiftWeight}
                onValueChange={setShiftWeight}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>0%</span>
                <span className="font-medium">{shiftWeight[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleAutoAssign}
            disabled={autoAssignMutation.isPending}
            className="bg-green-500 hover:bg-green-600"
          >
            <Wand2 size={16} className="mr-2" />
            {autoAssignMutation.isPending ? "Выполняется..." : "Запустить распределение"}
          </Button>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Info size={16} />
            <span>Алгоритм учитывает близость к остановкам, вместимость и смены</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
