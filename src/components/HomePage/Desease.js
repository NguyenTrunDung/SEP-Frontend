"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Activity, Brain, Zap } from "lucide-react"


const healthData = [
  {
    id: 1,
    title: "Tiểu Đường",
    icon: <Activity className="w-6 h-6" />,
    image: "/images/benh1.jpg",
    description:
      "Tiểu đường là tình trạng lượng đường trong máu tăng cao kéo dài do rối loạn chuyển hóa insulin. Bệnh có thể dẫn đến biến chứng nghiêm trọng về tim mạch, thận, thần kinh và thị lực nếu không kiểm soát tốt.",
    advice:
      "Hạn chế đường và các loại tinh bột nhanh hấp thu. Ưu tiên sử dụng rau xanh, ngũ cốc nguyên hạt để duy trì ổn định đường huyết.",
    nutrients: [
      { name: "Chất xơ", description: "(từ rau xanh, bí đao)", icon: "🥬" },
      { name: "Protein ít béo", description: "(cá hồi, đậu hũ)", icon: "🐟" },
      { name: "Carb phức tạp", description: "(yến mạch, gạo lứt)", icon: "🌾" },
      { name: "Chất béo lành mạnh", description: "(dầu ô liu)", icon: "🫒" },
    ],
    gradient: "from-lime-400 to-green-500",
  },
  {
    id: 2,
    title: "Huyết Áp Cao",
    icon: <Heart className="w-6 h-6" />,
    image: "/images/benh2.jpg",
    description:
      "Huyết áp cao thường không có triệu chứng rõ rệt nhưng làm tăng nguy cơ đột quỵ và các bệnh tim mạch nghiêm trọng nếu không kiểm soát tốt.",
    advice:
      "Giảm lượng muối trong khẩu phần ăn, tránh chất béo bão hòa động vật. Thường xuyên tập luyện thể dục để duy trì huyết áp ổn định.",
    nutrients: [
      { name: "Kali", description: "(chuối, khoai lang)", icon: "🍌" },
      { name: "Magie", description: "(cải bó xôi, hạt chia)", icon: "🥬" },
      { name: "Omega-3", description: "(cá thu, cá hồi)", icon: "🐟" },
      { name: "Chất xơ", description: "(đậu nành, cà chua)", icon: "🍅" },
    ],
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: 3,
    title: "Đột Quỵ",
    icon: <Brain className="w-6 h-6" />,
    image: "/images/benh3.jpg",
    description:
      "Đột quỵ xảy ra khi máu không thể lưu thông lên não, gây tổn thương tế bào não, có thể dẫn đến tàn tật hoặc tử vong nếu không được cấp cứu kịp thời.",
    advice:
      "Kiểm soát huyết áp, hạn chế stress, duy trì chế độ ăn uống lành mạnh và tập thể dục đều đặn để phòng ngừa đột quỵ.",
    nutrients: [
      { name: "Omega-3", description: "(cá béo như cá hồi)", icon: "🐟" },
      { name: "Chất chống oxy hóa", description: "(quả mọng)", icon: "🫐" },
      { name: "Chất béo không bão hòa", description: "(dầu thực vật)", icon: "🫒" },
      { name: "Chất xơ", description: "(ngũ cốc nguyên hạt)", icon: "🌾" },
    ],
    gradient: "from-emerald-400 to-teal-500",
  },
]

export default function HealthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % healthData.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % healthData.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + healthData.length) % healthData.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
        padding: "1rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          width: "100%",
        }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Modern Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              padding: "1rem 2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "0.5rem",
            }}
          >
            <Zap className="w-8 h-8 text-lime-500" />
            <h1
              style={{
                margin: "0",
                fontSize: "2rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #65a30d, #84cc16)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Thông Tin Sức Khỏe
            </h1>
          </div>
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              margin: "0",
              fontWeight: "500",
            }}
          >
            Hướng dẫn dinh dưỡng chuyên nghiệp cho sức khỏe tối ưu
          </p>
        </div>

        {/* Modern Carousel Container */}
        <div
          style={{
            position: "relative",
            borderRadius: "1.5rem",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Slides Container */}
          <div
            style={{
              position: "relative",
              height: "auto",
              minHeight: "650px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                minHeight: "100%",
              }}
            >
              {healthData.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    minWidth: "100%",
                    display: "flex",
                    padding: "2rem",
                    gap: "2rem",
                    alignItems: "flex-start",
                    background: `linear-gradient(135deg, ${index === currentSlide ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)"
                      }, rgba(255, 255, 255, 0.5))`,
                    transition: "background 0.8s ease",
                    minHeight: "650px",
                  }}
                >
                  {/* Content Section */}
                  <div
                    style={{
                      flex: "1",
                      maxWidth: "65%",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {/* Title with Icon */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.75rem",
                          borderRadius: "1rem",
                          background: `linear-gradient(135deg, ${item.gradient.replace("from-", "").replace("to-", ", ")})`,
                          color: "white",
                          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <h2
                        style={{
                          fontSize: "2rem",
                          fontWeight: "900",
                          color: "#1f2937",
                          margin: "0",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.title}
                      </h2>
                    </div>

                    {/* Description Card */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        padding: "1.5rem",
                        borderRadius: "1rem",
                        marginBottom: "1.5rem",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.7",
                          color: "#374151",
                          margin: "0",
                          fontWeight: "500",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Advice Section */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${item.gradient.replace("from-", "rgba(").replace("to-", ", rgba(").replace("400", "400, 0.1)").replace("500", "500, 0.1)")})`,
                        padding: "1.5rem",
                        borderRadius: "1rem",
                        marginBottom: "1.5rem",
                        border: "1px solid rgba(132, 204, 22, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          width: "4px",
                          height: "100%",
                          background: `linear-gradient(135deg, ${item.gradient.replace("from-", "").replace("to-", ", ")})`,
                        }}
                      />
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "700",
                          color: "#365314",
                          marginBottom: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        💡 Lời khuyên dinh dưỡng
                      </h3>
                      <p
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          color: "#365314",
                          margin: "0",
                          fontWeight: "500",
                        }}
                      >
                        {item.advice}
                      </p>
                    </div>

                    {/* Nutrients Grid */}
                    <div style={{ flex: "1" }}>
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: "#1f2937",
                          marginBottom: "1rem",
                        }}
                      >
                        🥗 Các thành phần nên có trong món ăn
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "0.75rem",
                        }}
                      >
                        {item.nutrients.map((nutrient, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(132, 204, 22, 0.2)",
                              borderRadius: "0.75rem",
                              padding: "1rem",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)"
                              e.currentTarget.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.1)"
                              e.currentTarget.style.borderColor = "#84cc16"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)"
                              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)"
                              e.currentTarget.style.borderColor = "rgba(132, 204, 22, 0.2)"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                              }}
                            >
                              <span style={{ fontSize: "1.25rem" }}>{nutrient.icon}</span>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    color: "#1f2937",
                                    fontSize: "0.9rem",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  {nutrient.name}
                                </div>
                                <div
                                  style={{
                                    color: "#6b7280",
                                    fontSize: "0.8rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  {nutrient.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div
                    style={{
                      flex: "0 0 300px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      paddingTop: "2rem",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "1.5rem",
                        overflow: "hidden",
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
                        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05) rotate(1deg)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1) rotate(0deg)"
                      }}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={300}
                        height={400}
                        style={{
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "1rem",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          background: `linear-gradient(135deg, transparent 0%, ${item.gradient.replace("from-", "rgba(").replace("to-", ", rgba(").replace("400", "400, 0.1)").replace("500", "500, 0.2)")} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Navigation Arrows */}
          <button
            onClick={prevSlide}
            style={{
              position: "absolute",
              left: "1.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(132, 204, 22, 0.9)"
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(132, 204, 22, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)"
              e.currentTarget.style.transform = "translateY(-50%) scale(1)"
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            <ChevronLeft size={24} color="#374151" />
          </button>

          <button
            onClick={nextSlide}
            style={{
              position: "absolute",
              right: "1.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(132, 204, 22, 0.9)"
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(132, 204, 22, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)"
              e.currentTarget.style.transform = "translateY(-50%) scale(1)"
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            <ChevronRight size={24} color="#374151" />
          </button>
        </div>

        {/* Modern Dots Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          {healthData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentSlide === index ? "3rem" : "1rem",
                height: "1rem",
                borderRadius: "0.5rem",
                border: "none",
                background:
                  currentSlide === index ? "linear-gradient(135deg, #84cc16, #65a30d)" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  currentSlide === index ? "0 4px 20px rgba(132, 204, 22, 0.4)" : "0 2px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
          ))}
        </div>

        {/* Modern Progress Bar */}
        <div
          style={{
            marginTop: "1rem",
            height: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "3px",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #84cc16, #65a30d)",
              width: `${((currentSlide + 1) / healthData.length) * 100}%`,
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              borderRadius: "3px",
              boxShadow: "0 0 20px rgba(132, 204, 22, 0.5)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
