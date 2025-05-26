/*import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, ResponsiveContainer
} from "recharts";

const Charts = ({ items, socket }) => {
    const [chartData, setChartData] = useState({
        priceDistribution: [],
        stylePopularity: [],
        salesTrend: []
    });

    const generateSalesTrendData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        return months.map((month) => ({
            name: month,
            sales: Math.floor(Math.random() * 10000) + 1000
        }));
    };

    const updateCharts = () => {
        if (!items || items.length === 0) return;

        // Price distribution
        const priceRanges = [
            { label: "$0-20", min: 0, max: 20 },
            { label: "$21-50", min: 21, max: 50 },
            { label: "$51-100", min: 51, max: 100 },
            { label: "$100+", min: 101, max: Infinity }
        ];

        const priceData = priceRanges.map(({ label, min, max }) => ({
            name: label,
            count: items.filter(item => item.price >= min && item.price <= max).length
        }));

        // Style popularity
        const styleCounts = {};
        items.forEach(item => {
            styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
        });

        const styleData = Object.keys(styleCounts).map(style => ({
            name: style,
            count: styleCounts[style]
        }));

        setChartData({
            priceDistribution: priceData,
            stylePopularity: styleData,
            salesTrend: generateSalesTrendData()
        });
    };

    useEffect(() => {
        updateCharts();

        if (socket) {
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (['NEW_ITEM', 'UPDATED_ITEM', 'DELETED_ITEM'].includes(message.type)) {
                    updateCharts();
                }
            };
        }

        const salesInterval = setInterval(() => {
            setChartData(prev => ({
                ...prev,
                salesTrend: generateSalesTrendData()
            }));
        }, 5000);

        return () => {
            clearInterval(salesInterval);
            if (socket) {
                socket.onmessage = null;
            }
        };
    }, [items, socket]);

        console.log("Items received in Charts:", items);

        if (!items || items.length === 0) {
            console.error("No items data available.");
            return;
        }

        const updateCharts = () => { 
            const priceRanges = [
                { label: "$0-20", min: 0, max: 20 },
                { label: "$21-50", min: 21, max: 50 },
                { label: "$51-100", min: 51, max: 100 },
                { label: "$100+", min: 101, max: Infinity }
            ];

            const priceData = priceRanges.map(({ label, min, max }) => ({
                name: label,
                count: items.filter((item) => item.price >= min && item.price <= max).length
            }));

            const styleCounts = {};
            items.forEach((item) => {
                styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
            });

            const styleData = Object.keys(styleCounts).map((style) => ({
                name: style,
                count: styleCounts[style]
            }));

            setChartData({
                priceDistribution: priceData,
                stylePopularity: styleData,
                salesTrend: generateSalesTrendData()
            });
        };

        updateCharts();

        const interval = setInterval(() => {
            setChartData((prev) => ({
                ...prev,
                salesTrend: generateSalesTrendData()
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, [items]);

    if (!chartData.priceDistribution.length) return <div>Loading charts...</div>;

    return (
        <div className="chart-container">
            <div className="chart-row">
                {/* Price Distribution Bar Chart *
                <div className="chart">
                    <h3>Price Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.priceDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Style Popularity Pie Chart *
                <div className="chart">
                    <h3>Style Popularity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.stylePopularity}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#82ca9d"
                                label
                            >
                                {chartData.stylePopularity.map((entry, index) => (
                                    <Cell
                                        key={`cell - ${index}`}
                                        fill={["#8884d8", "#FF8042", "#00C49F", "#FFBB28", "#01B43F", "#F4C59A"][index % 6]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-row">
                {/* Sales Trend Line Chart *
                <div className="chart">
                    <h3>Sales Trend (Live)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="sales" stroke="#FF8042" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Charts;*/


import React, { useState, useEffect, useCallback } from "react";
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, ResponsiveContainer
} from "recharts";

const Charts = ({ items, socket }) => {
    const [chartData, setChartData] = useState({
        priceDistribution: [],
        stylePopularity: [],
        salesTrend: [],
        categoryDistribution: []
    });
    const [mockItems, setMockItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Styles and categories for mock data
    const styles = ["punk", "grunge", "Y2K", "hippie", "classic", "modern"];
    const categories = ["earrings", "rings", "necklace", "piercing", "bracelets", "body chain"];

    // Generate mock item
    const generateMockItem = useCallback(() => {
        return {
            id: `mock-${Date.now()}`,
            name: `Item ${Math.floor(Math.random() * 1000)}`,
            description: "Mock data item",
            style: styles[Math.floor(Math.random() * styles.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            price: Math.floor(Math.random() * 200) + 10,
            createdAt: new Date().toISOString()
        };
    }, []);

    // Mock data generator effect
    useEffect(() => {
        // Initial batch of mock items
        const initialMockItems = Array.from({ length: 5 }, () => generateMockItem());
        setMockItems(initialMockItems);

        // Set up addition/removal interval
        const interval = setInterval(() => {
            setMockItems(prev => {
                // Add 1-2 new items
                const newItems = [...prev,
                generateMockItem(),
                ...(Math.random() > 0.5 ? [generateMockItem()] : [])
                ];

                // Remove 1-2 old items if we have more than 5
                if (newItems.length > 5) {
                    const removeCount = Math.random() > 0.5 ? 1 : 2;
                    return newItems.slice(removeCount);
                }
                return newItems;
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [generateMockItem]);

    // Calculate price distribution data
    const calculatePriceData = useCallback((items) => {
        const priceRanges = [
            { label: "$0-20", min: 0, max: 20 },
            { label: "$21-50", min: 21, max: 50 },
            { label: "$51-100", min: 51, max: 100 },
            { label: "$100+", min: 101, max: Infinity }
        ];

        return priceRanges.map(({ label, min, max }) => ({
            name: label,
            count: items.filter(item => item.price >= min && item.price <= max).length
        }));
    }, []);

    // Calculate style popularity data
    const calculateStyleData = useCallback((items) => {
        const styleCounts = {};
        items.forEach(item => {
            styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
        });
        return Object.keys(styleCounts).map(style => ({
            name: style,
            count: styleCounts[style]
        }));
    }, []);

    // Calculate category distribution data
    const calculateCategoryData = useCallback((items) => {
        const categoryCounts = {};
        items.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });
        return Object.keys(categoryCounts).map(category => ({
            name: category,
            count: categoryCounts[category]
        }));
    }, []);

    // Generate time-based sales trend data
    const generateTimeBasedTrendData = useCallback((items) => {
        const now = new Date();
        return Array.from({ length: 24 }, (_, i) => {
            const time = new Date(now);
            time.setHours(time.getHours() - (23 - i));

            return {
                name: time.toLocaleTimeString([], { hour: '2-digit' }),
                sales: items.filter(item => {
                    const itemTime = new Date(item.createdAt || now);
                    return itemTime.getHours() === time.getHours();
                }).length * 100
            };
        });
    }, []);

    // Update all charts when mock items change
    useEffect(() => {
        const combinedItems = [...items, ...mockItems];
        setChartData({
            priceDistribution: calculatePriceData(combinedItems),
            stylePopularity: calculateStyleData(combinedItems),
            salesTrend: generateTimeBasedTrendData(combinedItems),
            categoryDistribution: calculateCategoryData(combinedItems)
        });
        setIsLoading(false);
    }, [items, mockItems, calculatePriceData, calculateStyleData, calculateCategoryData, generateTimeBasedTrendData]);

    const COLORS = ['#8884d8', '#FF8042', '#00C49F', '#FFBB28', '#01B43F', '#F4C59A'];

    if (isLoading) {
        return (
            <div className="chart-container">
                <h2 className="chart-title">Jewelry Analytics Dashboard</h2>
                <p className="chart-subtitle">Loading chart data...</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h2 className="chart-title">Jewelry Analytics Dashboard</h2>
            <p className="chart-subtitle">Live demo data - updates every 3 seconds</p>

            <div className="chart-row">
                <div className="chart-card">
                    <h3>Price Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.priceDistribution} animationDuration={300}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" isAnimationActive={true} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Style Popularity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.stylePopularity}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                animationDuration={300}
                            >
                                {chartData.stylePopularity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [value, `${name}: ${(props.payload.percent * 100).toFixed(1)}%`]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-row">
                <div className="chart-card">
                    <h3>Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.categoryDistribution} animationDuration={300}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#00C49F" isAnimationActive={true} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Sales Trend (Live)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.salesTrend} animationDuration={300}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#FF8042"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Charts;