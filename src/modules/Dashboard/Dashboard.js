import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Typography, Select, Button, Table } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useOrders } from '../../hooks/queries/useOrders';
import { useRevenue } from '../../hooks/queries/useRevenue';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as XLSX from 'xlsx'; // Thêm import thư viện xlsx

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const { Title } = Typography;
const { Option } = Select;

const Dashboard = ({ branchId = '1' }) => {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
  });
  const [chartType, setChartType] = useState('day');

  const { orders, isLoading: isOrdersLoading, isError: isOrdersError, error: ordersError } = useOrders(branchId, {
    startOrderDate: dateRange.startDate?.format('YYYY-MM-DD'),
    endOrderDate: dateRange.endDate?.format('YYYY-MM-DD'),
  });
  const { revenues, isLoading: isRevenueLoading } = useRevenue(branchId, dateRange.startDate?.toDate(), chartType);

  console.log('useOrders response:', JSON.stringify(orders, null, 2));
  console.log('useRevenue response:', JSON.stringify(revenues, null, 2));

  // Tổng hợp dữ liệu thống kê
  const totalOrders = useMemo(() => {
    if (chartType === 'day') {
      return revenues?.[0]?.order || 0;
    }
    const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
    return completedOrders.length || revenues?.[0]?.order || 0;
  }, [orders, revenues, chartType]);

  const totalRevenue = useMemo(() => {
    if (chartType === 'day') {
      return revenues?.[0]?.total || 0;
    }
    const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
    return completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) || revenues?.[0]?.total || 0;
  }, [orders, revenues, chartType]);

  const totalItemsSold = useMemo(() => {
    if (chartType === 'day') {
      return revenues?.[0]?.quantityFood || 0;
    }
    const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
    return completedOrders.reduce(
      (sum, order) =>
        sum + (order.orderDetails?.reduce((acc, item) => acc + (item.Qty || item.quantity || 1), 0) || 0),
      0
    ) || revenues?.[0]?.quantityFood || 0;
  }, [orders, revenues, chartType]);

  const orderLabels = useMemo(() => {
    if (!dayjs.isDayjs(dateRange.startDate)) {
      console.warn('Invalid start date for orders, returning empty labels');
      return [];
    }
    if (chartType === 'year') {
      return Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'));
    } else if (chartType === 'month') {
      const daysInMonth = dateRange.startDate.daysInMonth();
      return Array.from({ length: daysInMonth }, (_, i) => dateRange.startDate.date(i + 1).format('DD/MM'));
    } else if (chartType === 'week') {
      return Array.from({ length: 7 }, (_, i) =>
        dateRange.startDate.startOf('week').add(i, 'days').format('DD/MM')
      );
    } else {
      return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    }
  }, [chartType, dateRange.startDate]);

  const orderData = useMemo(() => {
    const data = new Array(orderLabels.length).fill(0);
    const chartOrders = revenues?.[0]?.chartOrders || [];

    if (chartType === 'day') {
      chartOrders.forEach((item) => {
        const index = orderLabels.indexOf(item.date);
        if (index !== -1) {
          data[index] = item.orderCount || 0;
        } else {
          console.warn(`No matching label for chart order date: ${item.date}`);
        }
      });
    } else {
      chartOrders.forEach((item) => {
        try {
          const date = dayjs(item.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY-MM-DD HH:mm:ss', 'DD/MM'], true);
          if (!date.isValid()) {
            console.warn(`Invalid chart order date format: ${item.date}`);
            return;
          }
          if (
            chartType !== 'year' &&
            (date.isBefore(dateRange.startDate, 'day') || date.isAfter(dateRange.endDate, 'day'))
          ) {
            return;
          }
          let index;
          if (chartType === 'year') {
            if (date.year() === dateRange.startDate.year()) {
              index = date.month();
            }
          } else {
            index = orderLabels.indexOf(date.format('DD/MM'));
          }
          if (index !== -1) {
            data[index] = item.orderCount || 0;
          } else {
            console.warn(`No matching label for chart order date: ${item.date}, parsed: ${date.format()}`);
          }
        } catch (error) {
          console.error(`Error processing chart order date ${item.date}:`, error);
        }
      });

      const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
      completedOrders.forEach((order) => {
        if (order.orderDate) {
          try {
            const dateFormats = [
              'YYYY-MM-DD',
              'YYYY-MM-DDTHH:mm:ss.SSS',
              'YYYY-MM-DDTHH:mm:ss.SSSZ',
              'DD/MM/YYYY',
              'YYYY-MM-DD HH:mm:ss',
              'YYYY-MM-DDTHH:mm:ss',
            ];
            const parsedDate = dayjs(order.orderDate, dateFormats, true);
            if (!parsedDate.isValid()) {
              console.warn(`Invalid order date format for order ${order.id}: ${order.orderDate}`);
              return;
            }
            if (
              parsedDate.isBefore(dateRange.startDate, chartType) ||
              parsedDate.isAfter(dateRange.endDate, chartType)
            ) {
              console.warn(
                `Order ${order.id} outside date range: ${parsedDate.format()}, range: ${dateRange.startDate.format()} - ${dateRange.endDate.format()}`
              );
              return;
            }
            let index;
            if (chartType === 'year') {
              if (parsedDate.year() === dateRange.startDate.year()) {
                index = parsedDate.month();
              }
            } else if (chartType === 'day') {
              index = orderLabels.indexOf(parsedDate.format('HH:00'));
            } else {
              index = orderLabels.indexOf(parsedDate.format('DD/MM'));
            }
            if (index !== -1) {
              data[index] = (data[index] || 0) + 1;
              console.log(
                `Order ${order.id} (Completed) mapped to index ${index} (${orderLabels[index]}): count = ${data[index]}`
              );
            } else {
              console.warn(`No matching label for order date: ${order.orderDate}, parsed: ${parsedDate.format()}`);
            }
          } catch (error) {
            console.error(`Error parsing order date for order ${order.id}: ${order.orderDate}`, error);
          }
        }
      });
    }
    console.log('Order chart data:', JSON.stringify(data, null, 2));
    return {
      labels: orderLabels,
      datasets: [
        {
          label: 'Đơn hàng',
          data,
          backgroundColor: '#FFD700',
          borderColor: '#DAA520',
          borderWidth: 1,
          barPercentage: 0.5,
          borderRadius: 10,
        },
      ],
    };
  }, [orders, orderLabels, chartType, revenues, dateRange]);

  const revenueData = useMemo(() => {
    const data = new Array(orderLabels.length).fill(0);
    const chartOrders = revenues?.[0]?.chartOrders || [];

    if (chartType === 'day') {
      chartOrders.forEach((item) => {
        const index = orderLabels.indexOf(item.date);
        if (index !== -1) {
          data[index] = item.totalAmount || 0;
        } else {
          console.warn(`No matching label for chart order date: ${item.date}`);
        }
      });
    } else {
      chartOrders.forEach((item) => {
        try {
          const date = dayjs(item.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY-MM-DD HH:mm:ss', 'DD/MM'], true);
          if (!date.isValid()) {
            console.warn(`Invalid chart order date format: ${item.date}`);
            return;
          }
          if (
            chartType !== 'year' &&
            (date.isBefore(dateRange.startDate, 'day') || date.isAfter(dateRange.endDate, 'day'))
          ) {
            return;
          }
          let index;
          if (chartType === 'year') {
            if (date.year() === dateRange.startDate.year()) {
              index = date.month();
            }
          } else {
            index = orderLabels.indexOf(date.format('DD/MM'));
          }
          if (index !== -1) {
            data[index] = item.totalAmount || 0;
          } else {
            console.warn(`No matching label for chart order date: ${item.date}, parsed: ${date.format()}`);
          }
        } catch (error) {
          console.error(`Error processing chart order date ${item.date}:`, error);
        }
      });

      const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
      completedOrders.forEach((order) => {
        if (order.orderDate) {
          try {
            const dateFormats = [
              'YYYY-MM-DD',
              'YYYY-MM-DDTHH:mm:ss.SSS',
              'YYYY-MM-DDTHH:mm:ss.SSSZ',
              'DD/MM/YYYY',
              'YYYY-MM-DD HH:mm:ss',
              'YYYY-MM-DDTHH:mm:ss',
            ];
            const parsedDate = dayjs(order.orderDate, dateFormats, true);
            if (!parsedDate.isValid()) {
              console.warn(`Invalid order date format for order ${order.id}: ${order.orderDate}`);
              return;
            }
            if (
              parsedDate.isBefore(dateRange.startDate, chartType) ||
              parsedDate.isAfter(dateRange.endDate, chartType)
            ) {
              console.warn(
                `Order ${order.id} outside date range: ${parsedDate.format()}, range: ${dateRange.startDate.format()} - ${dateRange.endDate.format()}`
              );
              return;
            }
            let index;
            if (chartType === 'year') {
              if (parsedDate.year() === dateRange.startDate.year()) {
                index = parsedDate.month();
              }
            } else if (chartType === 'day') {
              index = orderLabels.indexOf(parsedDate.format('HH:00'));
            } else {
              index = orderLabels.indexOf(parsedDate.format('DD/MM'));
            }
            if (index !== -1) {
              data[index] = (data[index] || 0) + (order.total || 0);
              console.log(
                `Order ${order.id} (Completed) mapped to index ${index} (${orderLabels[index]}): revenue = ${data[index]}`
              );
            } else {
              console.warn(`No matching label for order date: ${order.orderDate}, parsed: ${parsedDate.format()}`);
            }
          } catch (error) {
            console.error(`Error parsing order date for order ${order.id}: ${order.orderDate}`, error);
          }
        }
      });
    }
    console.log('Revenue chart data:', JSON.stringify(data, null, 2));
    return {
      labels: orderLabels,
      datasets: [
        {
          label: 'Doanh thu',
          data,
          backgroundColor: '#FFD700',
          borderColor: '#DAA520',
          borderWidth: 1,
          barPercentage: 0.5,
          borderRadius: 10,
        },
      ],
    };
  }, [orders, orderLabels, chartType, revenues, dateRange]);

  // New useMemo hook for most ordered dishes
  const mostOrderedDishes = useMemo(() => {
    try {
      console.group('Most Ordered Dishes Calculation');
      console.log('Raw orders data:', JSON.stringify(orders, null, 2));
      
      // Validate orders data
      if (!orders || !Array.isArray(orders)) {
        console.warn('Invalid orders data: not an array');
        return [];
      }

      const completedOrders = orders.filter(order => {
        // More robust order status checking
        const validStatuses = ['Completed', 'completed', 'COMPLETED'];
        return validStatuses.includes(order.status);
      });

      console.log('Completed orders:', JSON.stringify(completedOrders, null, 2));

      // Advanced dish quantity extraction
      const processDishQuantities = (orders) => {
        const dishDetails = {};

        orders.forEach((order, orderIndex) => {
          if (!order.orderDetails || !Array.isArray(order.orderDetails)) {
            console.warn(`Order ${order.id || orderIndex} has no valid order details`);
            return;
          }

          order.orderDetails.forEach((item, itemIndex) => {
            // Comprehensive dish name extraction
            const dishName = 
              item.foodName || 
              item.name || 
              item.foodTitle || 
              item.title || 
              item.dishName || 
              'Unnamed Dish';

            console.group(`Analyzing Dish: ${dishName}`);
            console.log('Full Item Details:', JSON.stringify(item, null, 2));

            // Advanced quantity extraction methods
            const extractQuantity = () => {
              // Method 1: Direct numeric fields
              const numericFields = [
                'Qty', 
                'quantity', 
                'amount', 
                'count', 
                'servings'
              ];

              for (let field of numericFields) {
                if (typeof item[field] === 'number' && item[field] > 0) {
                  console.log(`Using ${field}: ${item[field]}`);
                  return item[field];
                }
              }

              // Method 2: Parse string quantities
              const stringFields = [
                'Qty', 
                'quantity', 
                'amount', 
                'count', 
                'servings'
              ];

              for (let field of stringFields) {
                if (typeof item[field] === 'string') {
                  const parsedValue = parseInt(item[field], 10);
                  if (!isNaN(parsedValue) && parsedValue > 0) {
                    console.log(`Parsed ${field} from string: ${parsedValue}`);
                    return parsedValue;
                  }
                }
              }

              // Method 3: Check for explicit quantity in nested objects
              if (item.quantity && typeof item.quantity === 'object') {
                const nestedNumericFields = ['value', 'amount', 'count'];
                for (let nestedField of nestedNumericFields) {
                  if (typeof item.quantity[nestedField] === 'number' && item.quantity[nestedField] > 0) {
                    console.log(`Using nested quantity ${nestedField}: ${item.quantity[nestedField]}`);
                    return item.quantity[nestedField];
                  }
                }
              }

              // Fallback to 1 if no quantity found
              console.log('Defaulting to 1 - No valid quantity found');
              return 1;
            };

            // Calculate safe quantity
            const safeQuantity = extractQuantity();

            console.log(`Calculated Quantity for ${dishName}: ${safeQuantity}`);
            console.groupEnd();

            // Aggregate quantities
            if (!dishDetails[dishName]) {
              dishDetails[dishName] = {
                totalQuantity: 0,
                orderCount: 0,
                itemDetails: []
              };
            }

            dishDetails[dishName].totalQuantity += safeQuantity;
            dishDetails[dishName].orderCount++;
            dishDetails[dishName].itemDetails.push({
              orderId: order.id,
              quantity: safeQuantity,
              rawItem: item
            });
          });
        });

        return dishDetails;
      };

      // Process dish quantities
      const dishQuantities = processDishQuantities(completedOrders);

      console.log('Detailed Dish Quantities:', JSON.stringify(dishQuantities, null, 2));

      // Sort and get top dishes
      const sortedDishes = Object.entries(dishQuantities)
        .map(([name, details]) => ({
          name, 
          quantity: details.totalQuantity,
          orderCount: details.orderCount,
          details: details.itemDetails
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

      console.log('Sorted Dishes:', JSON.stringify(sortedDishes, null, 2));
      console.groupEnd();

      return sortedDishes.length > 0 ? sortedDishes : [];
    } catch (error) {
      console.error('Error in mostOrderedDishes calculation:', error);
      return [];
    }
  }, [orders]);

  // Hàm xuất file Excel
  const exportToExcel = () => {
    const completedOrders = orders?.filter(order => order.status === 'Completed') || [];
    const excelData = completedOrders.map(order => ({
      'Mã đơn hàng': order.id,
      'Ngày đặt hàng': dayjs(order.orderDate).format('DD/MM/YYYY HH:mm:ss'),
      'Tổng tiền': order.total?.toLocaleString('vi-VN') || 0,
      'Số món ăn': order.orderDetails?.reduce((acc, item) => acc + (item.Qty || item.quantity || 1), 0) || 0,
      'Trạng thái': order.status,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    
    // Thêm thông tin tổng quan
    const summaryData = [
      { 'Tổng đơn hàng': totalOrders, 'Tổng doanh thu': totalRevenue.toLocaleString('vi-VN'), 'Tổng món ăn bán được': totalItemsSold }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    XLSX.writeFile(wb, `Dashboard_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return value === 0 ? 'Không có đơn hàng' : `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#000' },
        grid: { color: '#e0e0e0' },
      },
      x: { ticks: { color: '#666' } },
    },
  };

  const chartOptionsRevenue = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return value === 0 ? 'Không có doanh thu' : `${context.dataset.label}: ${value.toLocaleString('vi-VN')} VNĐ`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 100000,
          callback: (value) => `${value.toLocaleString('vi-VN')} VNĐ`,
          color: '#000',
        },
        grid: { color: '#e0e0e0' },
      },
      x: { ticks: { color: '#666' } },
    },
  };

  const handleDateChange = (date) => {
    if (!date || !dayjs.isDayjs(date)) {
      console.warn('Invalid date selected');
      return;
    }
    let newStartDate, newEndDate;
    if (chartType === 'year') {
      newStartDate = date.startOf('year');
      newEndDate = date.endOf('year');
    } else if (chartType === 'month') {
      newStartDate = date.startOf('month');
      newEndDate = date.endOf('month');
    } else if (chartType === 'week') {
      newStartDate = date.startOf('week');
      newEndDate = date.endOf('week');
    } else {
      newStartDate = date.startOf('day');
      newEndDate = date.endOf('day');
    }
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={12} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <DatePicker
            picker={chartType === 'year' ? 'year' : chartType === 'month' ? 'month' : 'date'}
            value={dateRange.startDate}
            onChange={handleDateChange}
            placeholder={
              chartType === 'year'
                ? 'Chọn năm'
                : chartType === 'month'
                ? 'Chọn tháng'
                : chartType === 'week'
                ? 'Chọn tuần'
                : 'Chọn ngày'
            }
            format={chartType === 'year' ? 'YYYY' : chartType === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY'}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Col>
        <Col>
          <Select
            value={chartType}
            onChange={(value) => {
              setChartType(value);
              setDateRange({
                startDate: dayjs().startOf(
                  value === 'year' ? 'year' : value === 'month' ? 'month' : value === 'week' ? 'week' : 'day'
                ),
                endDate: dayjs().endOf(
                  value === 'year' ? 'year' : value === 'month' ? 'month' : value === 'week' ? 'week' : 'day'
                ),
              });
            }}
            style={{ width: 120 }}
          >
            <Option value="day">Ngày</Option>
            <Option value="week">Tuần</Option>
            <Option value="month">Tháng</Option>
            <Option value="year">Năm</Option>
          </Select>
        </Col>
        <Col>
          <Button type="primary" onClick={exportToExcel} disabled={isOrdersLoading || isRevenueLoading}>
            Xuất Excel
          </Button>
        </Col>
      </Row>
      {isOrdersError && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Lỗi khi tải đơn hàng: {ordersError?.message || 'Không thể tải dữ liệu đơn hàng'}
        </div>
      )}
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: '#ff4d4f',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 90,
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  Số đơn hàng
                </span>
              }
              value={totalOrders}
              valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
              loading={isOrdersLoading || isRevenueLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: '#0d9494',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 90,
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  Doanh thu
                </span>
              }
              value={totalRevenue}
              valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
              loading={isOrdersLoading || isRevenueLoading}
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: '#00CC66',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 90,
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  Số món ăn bán được
                </span>
              }
              value={totalItemsSold}
              valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
              loading={isOrdersLoading || isRevenueLoading}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 32 }}>
        <Title level={4} style={{ marginBottom: 16, fontSize: 34 }}>
          Đơn hàng
        </Title>
        {isOrdersLoading || isRevenueLoading ? (
          <p>Đang tải dữ liệu đơn hàng...</p>
        ) : (
          <>
            <Bar data={orderData} options={chartOptions} />
            <p style={{ textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
              Biểu đồ số đơn hàng theo{' '}
              {chartType === 'day' ? 'giờ' : chartType === 'week' ? 'tuần' : chartType === 'month' ? 'tháng' : 'năm'}
            </p>
          </>
        )}
      </div>
      <div style={{ marginTop: 32 }}>
        <Title level={4} style={{ marginBottom: 16, fontSize: 34 }}>
          Doanh thu
        </Title>
        {isRevenueLoading ? (
          <p>Đang tải dữ liệu doanh thu...</p>
        ) : (
          <>
            <Bar data={revenueData} options={chartOptionsRevenue} />
            <p style={{ textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
              Biểu đồ doanh thu theo{' '}
              {chartType === 'day' ? 'giờ' : chartType === 'week' ? 'tuần' : chartType === 'month' ? 'tháng' : 'năm'}
            </p>
          </>
        )}
      </div>
   {/* Dish Statistics Section */}
<div style={{ marginTop: 32 }}>
  <Title level={4} style={{ marginBottom: 16, fontSize: 34 }}>
    Số món ăn bán được
  </Title>
  <Card>
    {mostOrderedDishes.length > 0 ? (
      <Row gutter={[16, 16]}>
        {/* Biểu đồ */}
        <Col span={16}>
          <Bar 
            data={{
              labels: mostOrderedDishes.map(dish => dish.name),
              datasets: [{
                label: 'Số lượng',
                data: mostOrderedDishes.map(dish => dish.quantity),
                backgroundColor: '#FFD700',
                borderColor: '#DAA520',
                borderWidth: 1,
                borderRadius: 10,
                barPercentage: 0.04,
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { 
                  display: true, 
                  position: 'top' 
                },
                title: {
                  display: true,
                  text: 'Biểu đồ số món ăn bán được',
                  font: {
                    size: 20,
                    weight: 'bold'
                  },
                  color: '#333',
                  padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed.y;
                      return value === 0 
                        ? 'Không có đơn hàng' 
                        : `${context.dataset.label}: ${value}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Số lượng'
                  },
                  ticks: { 
                    stepSize: 1, 
                    color: '#000' 
                  },
                  grid: { color: '#e0e0e0' }
                },
                x: { 
                  ticks: { 
                    color: '#666',
                    font: {
                      style: 'italic',
                      size: 14 // 👈 chữ in nghiêng to hơn
                    },
                    minRotation: 45,
                    maxRotation: 45,
                    autoSkip: false
                  } 
                }
              }
            }}
          />
          <p style={{ 
            textAlign: 'center', 
            marginTop: 12, 
            fontStyle: 'italic', 
            color: '#666',
            fontSize: 14 
          }}>
            Biểu đồ hiển thị số món ăn bán được
          </p>
        </Col>

        {/* Bảng */}
        <Col span={8}>
          <Table 
            dataSource={mostOrderedDishes.map((dish, index) => ({
              ...dish,
              key: index
            }))} 
            columns={[
              {
                title: <span style={{ fontSize: 20 }}>Tên Món</span>,
                dataIndex: 'name',
                key: 'name',
                render: (text) => (
                  <div style={{ fontSize: 19, textAlign: 'left' }}>
                    {text}
                  </div>
                ),
                width: '50%'
              },
              {
                title: <span style={{ fontSize: 20 }}>Số Lượng</span>,
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                width: '50%',
                render: (quantity) => (
                  <span style={{ fontSize: 19, display: 'block', textAlign: 'center' }}>
                    {quantity.toLocaleString()}
                  </span>
                )
              }
            ]}
            pagination={false}
            size="small"
            bordered={false}
            showHeader={true}
            style={{ 
              width: '100%',
              border: '1px solid #f0f0f0'
            }}
          />
        </Col>
      </Row>
    ) : (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#666' 
      }}>
        Không có dữ liệu về các món ăn được bán
      </div>
    )}
  </Card>
</div>


    </div>
  );
};

export default Dashboard;