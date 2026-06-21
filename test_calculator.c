#define main calculator_main
#include "calculator.c"
#undef main
#include <assert.h>

int main() {
    CarbonMetric metric;
    
    // Test case 1: Low impact vegan setup
    calculate_carbon("walking", 0, "none", 0, 0, 0, 0, 0, "vegan", 1, 1, "full", &metric);
    // transport = 0, electricity = 0, food = 1.1, waste = 0.1 (floor limit)
    // total = 1.2
    assert(metric.dailyTotal >= 1.19 && metric.dailyTotal <= 1.21);
    assert(strcmp(metric.grade, "A+") == 0);

    // Test case 2: Heavy impact diesel car setup
    calculate_carbon("car", 50, "diesel", 8, 10, 4, 6, 2, "mixed", 5, 4, "none", &metric);
    // transport = 50 * 0.42 * 1.25 = 26.25
    // electricity = (8*1.2*0.5) + (10*0.075*0.5) + (4*0.1*0.5) + (6*0.2*0.5) + (2*0.015*0.5) = 4.8 + 0.375 + 0.2 + 0.6 + 0.015 = 5.99
    // food = 3.6
    // waste = (5*0.25) + (4*0.35) = 1.25 + 1.40 = 2.65
    // total = 26.25 + 5.99 + 3.6 + 2.65 = 38.49
    assert(metric.dailyTotal >= 38.48 && metric.dailyTotal <= 38.50);
    assert(strcmp(metric.grade, "F") == 0);

    printf("C unit tests passed successfully!\n");
    return 0;
}
