const { toDateKey } = require("./habit.service");

function normalizeDate(date = new Date()) {
  const dateKey = toDateKey(date);
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function isBetweenScheduleBounds(habit, date) {
  const dateKey = toDateKey(date);
  const startDateKey = habit.startDate ? toDateKey(habit.startDate) : toDateKey(habit.createdAt || new Date());
  const endDateKey = habit.endDate ? toDateKey(habit.endDate) : null;
  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

function isHabitScheduledOnDate(habit, date) {
  if (!isBetweenScheduleBounds(habit, date)) {
    return false;
  }

  const dateKey = toDateKey(date);
  const weekday = new Date(date).getUTCDay();
  const scheduledDays = habit.scheduledDays || [];

  if (habit.frequency === "specific_dates") {
    return (habit.specificDates || []).map(d => toDateKey(d)).includes(dateKey);
  }

  if (habit.frequency === "custom_weekdays") {
    return scheduledDays.includes(weekday);
  }

  if (habit.frequency === "weekly") {
    if (scheduledDays.length) {
      return scheduledDays.includes(weekday);
    }
    const startDay = new Date(habit.startDate || habit.createdAt || new Date()).getUTCDay();
    return weekday === startDay;
  }

  return true;
}

function getScheduledCount(habit, days, refDate = new Date()) {
  let count = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(refDate);
    checkDate.setUTCDate(checkDate.getUTCDate() - i);
    if (isHabitScheduledOnDate(habit, checkDate)) {
      count++;
    }
  }
  return count || 1;
}

function getWeeklyScheduledLoad(habit) {
  if (habit.frequency === "daily") return 7;
  if (habit.frequency === "weekly") return habit.scheduledDays?.length || 1;
  if (habit.frequency === "custom_weekdays") return habit.scheduledDays?.length || 1;
  if (habit.frequency === "specific_dates") return 1;
  return 7;
}

function calculateForecast(habits, serializedHabits) {
  const now = new Date();
  const todayKey = toDateKey(now);

  let totalScheduled30 = 0;
  let totalCompletions30 = 0;
  let totalScheduled7 = 0;
  let totalCompletions7 = 0;
  let totalScheduled23 = 0; // days 8-30
  let totalCompletions23 = 0;

  let hasHighStreak = false;
  let totalWeeklyLoad = 0;

  const habitsForecast = serializedHabits.map((serialized) => {
    const rawHabit = habits.find(h => String(h._id) === String(serialized.id));
    const completedDates = rawHabit?.completedDates || [];
    
    // Streaks
    const currentStreak = serialized.streak || 0;
    if (currentStreak > 14) {
      hasHighStreak = true;
    }

    // Weekly Load
    totalWeeklyLoad += getWeeklyScheduledLoad(serialized);

    // Calculate completions in periods
    const refDate = normalizeDate(now);
    const scheduled30 = getScheduledCount(serialized, 30, refDate);
    const scheduled7 = getScheduledCount(serialized, 7, refDate);
    const scheduled23 = Math.max(1, scheduled30 - scheduled7);

    const completed30List = completedDates.filter(d => {
      const diffDays = (refDate - normalizeDate(d)) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays < 30;
    });
    const completed7List = completedDates.filter(d => {
      const diffDays = (refDate - normalizeDate(d)) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    const completions30 = completed30List.length;
    const completions7 = completed7List.length;
    const completions23 = Math.max(0, completions30 - completions7);

    totalScheduled30 += scheduled30;
    totalCompletions30 += completions30;
    totalScheduled7 += scheduled7;
    totalCompletions7 += completions7;
    totalScheduled23 += scheduled23;
    totalCompletions23 += completions23;

    // Consistency Rates
    const consistency30 = completions30 / scheduled30;
    const consistency7 = completions7 / scheduled7;

    // Success Probability
    // 60% 30-day rate, 30% 7-day rate, 10% current streak booster
    const streakBooster = Math.min(10, currentStreak) / 10;
    let successProbability = 0.5; // baseline default

    if (completions30 > 0 || completions7 > 0) {
      successProbability = (consistency30 * 0.6) + (consistency7 * 0.3) + (streakBooster * 0.1);
    }
    
    // Convert to percentage & clamp between 10% and 100%
    const successRate = Math.min(100, Math.max(10, Math.round(successProbability * 100)));
    
    // Future Streak Prediction (predicted streak after next 7 days)
    const predictedStreak = currentStreak + Math.round((successRate / 100) * 7);

    return {
      id: serialized.id,
      title: serialized.title,
      frequency: serialized.frequency,
      currentStreak,
      predictedStreak,
      successProbability: successRate,
      recentCompletions: completions7,
      totalCompletions: completedDates.length,
    };
  });

  // Calculate Momentum
  const recentCompletionRate = totalScheduled7 ? (totalCompletions7 / totalScheduled7) : 0;
  const historicalCompletionRate = totalScheduled23 ? (totalCompletions23 / totalScheduled23) : 0;
  const momentumValue = recentCompletionRate - historicalCompletionRate;
  const momentumPercentage = Math.round(momentumValue * 100);
  
  let momentumStatus = "Stable";
  if (momentumPercentage > 5) {
    momentumStatus = "Accelerating";
  } else if (momentumPercentage < -5) {
    momentumStatus = "Decelerating";
  }

  // Calculate Burnout Risk
  let burnoutScore = 0;
  // 1. Active habits count (10 points per habit above 4, max 40)
  const habitCount = serializedHabits.length;
  if (habitCount > 4) {
    burnoutScore += Math.min(40, (habitCount - 4) * 10);
  }
  // 2. High Streak Fatigue (15 points)
  if (hasHighStreak) {
    burnoutScore += 15;
  }
  // 3. Weekly scheduled load (over-commitment: > 20 scheduled tasks a week, up to 25 points)
  if (totalWeeklyLoad > 20) {
    burnoutScore += Math.min(25, (totalWeeklyLoad - 20) * 2.5);
  }
  // 4. Sudden activity spike (last 7 days > 90% while historical < 40% -> danger zone, 20 points)
  if (recentCompletionRate > 0.9 && historicalCompletionRate < 0.4) {
    burnoutScore += 20;
  }
  
  const finalBurnoutScore = Math.min(100, Math.round(burnoutScore));
  let burnoutRiskLevel = "Low";
  let burnoutAdvice = "Healthy, balanced workload. Keep pacing yourself!";
  if (finalBurnoutScore > 85) {
    burnoutRiskLevel = "Extreme";
    burnoutAdvice = "Highly overcommitted! Strongly recommend pausing or reducing habits to avoid mental fatigue.";
  } else if (finalBurnoutScore > 60) {
    burnoutRiskLevel = "High";
    burnoutAdvice = "Workload is heavy. Ensure you schedule rest days or ease up on strict scheduling.";
  } else if (finalBurnoutScore > 30) {
    burnoutRiskLevel = "Moderate";
    burnoutAdvice = "Pace is sustainable, but watch out for adding more habits too quickly.";
  }

  // Monthly Consistency Forecast (Average success probability across all habits)
  const averageSuccessProb = habitsForecast.length
    ? Math.round(habitsForecast.reduce((sum, h) => sum + h.successProbability, 0) / habitsForecast.length)
    : 50;

  // Weekly Completion Forecast (Next 7 days, day-by-day)
  const weeklyForecast = [];
  const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(now.getDate() + i);
    const dateStr = toDateKey(forecastDate);
    const dayLabel = dayFormatter.format(forecastDate);

    let expectedCompletions = 0;
    let targetCompletions = 0;

    serializedHabits.forEach((serialized) => {
      if (isHabitScheduledOnDate(serialized, forecastDate)) {
        targetCompletions++;
        const prob = habitsForecast.find(h => h.id === serialized.id)?.successProbability || 50;
        expectedCompletions += prob / 100;
      }
    });

    weeklyForecast.push({
      date: dateStr,
      day: dayLabel,
      expectedCompletions: Number(expectedCompletions.toFixed(1)),
      targetCompletions,
    });
  }

  return {
    burnout: {
      score: finalBurnoutScore,
      riskLevel: burnoutRiskLevel,
      advice: burnoutAdvice,
    },
    momentum: {
      percentage: momentumPercentage,
      status: momentumStatus,
    },
    monthlyForecast: {
      consistency: averageSuccessProb,
    },
    habitsForecast,
    weeklyForecast,
  };
}

module.exports = {
  calculateForecast,
};
