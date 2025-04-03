import { View, Dimensions, Text, StyleSheet } from "react-native";
import React from "react";
import { PieChart } from "react-native-chart-kit";
import { colors } from "../styles/styles";

const screenWidth = Dimensions.get("screen").width - 60 - 60;

const Chart = ({ inStock = 0, outOfStock = 0 }) => {
  const data = [
    {
      name: "Out of Stock",
      population: outOfStock,
      color: "crimson",
      legendFontColor: colors.color2,
    },
    {
      name: "In Stock",
      population: inStock,
      color: colors.color1_light2,
      legendFontColor: colors.color2,
    },
  ];

  const chartConfig = {
    color: (opacity = 1) => `rgba(26,255,146,${opacity})`,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Sales Per Day</Text>

      <PieChart
        data={data}
        width={screenWidth}
        height={150}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor="transparent"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.color3,
    borderRadius: 20,
    paddingVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.color2,
    marginBottom: 10,
  },
});

export default Chart;