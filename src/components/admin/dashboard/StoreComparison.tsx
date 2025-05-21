
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Layers, Store, CircleDollarSign } from "lucide-react";
import { Product } from "@/components/products/ProductCard";
import { Location } from "@/api/locations";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StoreComparisonProps {
  products: Product[];
  locations: Location[];
}

const StoreComparison = ({ products, locations }: StoreComparisonProps) => {
  const [comparisonMetric, setComparisonMetric] = useState<string>("totalProducts");

  // Group products by location
  const productsByLocation = useMemo(() => {
    const grouped = {};
    
    products.forEach(product => {
      if (!grouped[product.locationId]) {
        grouped[product.locationId] = {
          products: [],
          totalValue: 0,
          inStockCount: 0,
          outOfStockCount: 0,
          averagePrice: 0,
          totalProducts: 0
        };
      }
      
      grouped[product.locationId].products.push(product);
      grouped[product.locationId].totalValue += product.price * product.quantity;
      if (product.inStock) {
        grouped[product.locationId].inStockCount++;
      } else {
        grouped[product.locationId].outOfStockCount++;
      }
      grouped[product.locationId].totalProducts++;
    });
    
    // Calculate averages
    Object.keys(grouped).forEach(locationId => {
      const locationData = grouped[locationId];
      locationData.averagePrice = locationData.products.length > 0 
        ? Math.round(locationData.products.reduce((sum, p) => sum + p.price, 0) / locationData.products.length)
        : 0;
    });
    
    return grouped;
  }, [products]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return locations.map(location => {
      const locationProducts = productsByLocation[location.id] || {
        totalProducts: 0,
        inStockCount: 0,
        totalValue: 0,
        averagePrice: 0
      };
      
      return {
        name: location.name,
        totalProducts: locationProducts.totalProducts,
        inStock: locationProducts.inStockCount,
        totalValue: Math.round(locationProducts.totalValue / 1000), // En milliers de FCFA
        averagePrice: locationProducts.averagePrice
      };
    });
  }, [locations, productsByLocation]);

  const metricOptions = [
    { value: "totalProducts", label: "Nombre de produits", color: "#9b87f5", icon: Layers },
    { value: "inStock", label: "Produits en stock", color: "#82ca9d", icon: Store },
    { value: "totalValue", label: "Valeur totale (K FCFA)", color: "#8884d8", icon: CircleDollarSign },
    { value: "averagePrice", label: "Prix moyen (FCFA)", color: "#ffc658", icon: BarChart }
  ];

  const selectedMetric = metricOptions.find(m => m.value === comparisonMetric) || metricOptions[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="mr-2 h-5 w-5" />
              Comparaison des magasins
            </CardTitle>
            <Select
              value={comparisonMetric}
              onValueChange={setComparisonMetric}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sélectionner une métrique" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey={comparisonMetric} 
                  name={selectedMetric.label} 
                  fill={selectedMetric.color} 
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {locations.map(location => {
          const locationData = productsByLocation[location.id] || {
            totalProducts: 0,
            inStockCount: 0,
            outOfStockCount: 0,
            totalValue: 0,
            averagePrice: 0
          };
          
          const stockPercentage = locationData.totalProducts > 0
            ? Math.round((locationData.inStockCount / locationData.totalProducts) * 100)
            : 0;
            
          return (
            <Card key={location.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {location.name}
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {locationData.totalProducts} produits
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En stock:</span>
                    <span>{locationData.inStockCount} ({stockPercentage}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valeur:</span>
                    <span>{Math.round(locationData.totalValue / 1000)}K FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix moyen:</span>
                    <span>{locationData.averagePrice.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StoreComparison;
