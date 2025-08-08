import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Typography, Select, Button } from 'antd';
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
    </div>
  );
};

export default Dashboard;