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
    assert(metric.dailyTotal >= 38.48 && metric.dailyTotal <= 38.50);
    assert(strcmp(metric.grade, "F") == 0);

    // Test case 3: Cycling (active transport zero emissions)
    calculate_carbon("cycling", 30, "none", 0, 0, 0, 0, 0, "vegan", 1, 1, "full", &metric);
    assert(metric.transport >= -0.01 && metric.transport <= 0.01);
    assert(metric.dailyTotal >= 1.19 && metric.dailyTotal <= 1.21);

    // Test case 4: Metro transit commute
    calculate_carbon("metro", 25, "none", 0, 0, 0, 0, 0, "vegan", 1, 1, "full", &metric);
    // transport = 25 * 0.04 = 1.0
    // total = 1.0 + 1.2 = 2.2
    assert(metric.transport >= 0.99 && metric.transport <= 1.01);
    assert(metric.dailyTotal >= 2.19 && metric.dailyTotal <= 2.21);

    // Test case 5: High power usage
    calculate_carbon("none", 0, "none", 24, 24, 24, 24, 10, "mixed", 5, 5, "none", &metric);
    // electricity total = 18.975, food = 3.6, waste = 3.0, total = 25.575
    assert(metric.electricity >= 18.97 && metric.electricity <= 18.99);
    assert(metric.dailyTotal >= 25.57 && metric.dailyTotal <= 25.58);

    printf("C unit tests passed successfully!\n");
    return 0;
}
