import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import { colors } from "../styles/styles";

const screenWidth = Dimensions.get('screen').width - 60 - 60;

const SalesChart = ({ salesData }) => {
  if (!salesData || salesData.length === 0) {
    // Handle empty or undefined salesData
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>No sales data available</Text>
      </View>
    );
  }

  // Sort salesData by date in ascending order
  salesData.sort((a, b) => new Date(a._id) - new Date(b._id));

  const chartData = {
    labels: salesData.map(data => {
      // Format date to display only month and day
      const date = new Date(data._id);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }),
    datasets: [
      {
        data: salesData.map(data => data.totalSales), // Use total sales data from salesData
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.color3,
    backgroundGradientFrom: colors.color3,
    backgroundGradientTo: colors.color3,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Sales Per Day</Text>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
        }}
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

export default SalesChart;
