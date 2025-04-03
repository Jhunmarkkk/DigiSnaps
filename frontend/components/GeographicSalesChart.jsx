import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors } from '../styles/styles';

const GeographicSalesChart = ({ salesByCity }) => {
  // Extract city names and sales amounts from the salesByCity data
  const data = salesByCity.map(cityData => ({
    name: cityData._id,
    value: cityData.totalSales,
    color: `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')}`, // Random color
    legendFontColor: "white",
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Geographic Sales</Text>
      <PieChart
        data={data}
        width={300}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: '3',
          },
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
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

export default GeographicSalesChart;
