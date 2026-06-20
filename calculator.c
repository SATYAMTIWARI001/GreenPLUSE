#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    double transport;
    double electricity;
    double food;
    double waste;
    double dailyTotal;
    double yearlyTotal;
    char grade[3];
    int comparison;
} CarbonMetric;

void calculate_carbon(char* vehicle, double distance, char* fuel, 
                      double ac, double fan, double tv, double computer, double mobileCharging,
                      char* diet, double plasticScale, double foodWasteScale, char* recycling,
                      CarbonMetric* out) 
{
    // 1. Transportation Index
    double transportFactor = 0.0;
    if (strcmp(vehicle, "car") == 0) transportFactor = 0.42;
    else if (strcmp(vehicle, "bike") == 0) transportFactor = 0.15;
    else if (strcmp(vehicle, "bus") == 0) transportFactor = 0.08;
    else if (strcmp(vehicle, "train") == 0) transportFactor = 0.05;
    else if (strcmp(vehicle, "metro") == 0) transportFactor = 0.04;

    out->transport = distance * transportFactor;
    if (strcmp(vehicle, "car") == 0) {
        if (strcmp(fuel, "diesel") == 0) out->transport *= 1.25;
        else if (strcmp(fuel, "electric") == 0) out->transport *= 0.15;
        else if (strcmp(fuel, "hybrid") == 0) out->transport *= 0.60;
    }

    // 2. Electricity usage (kWh to equivalent CO2 conversion)
    out->electricity = (ac * 1.2 * 0.5) + (fan * 0.075 * 0.5) + (tv * 0.1 * 0.5) + (computer * 0.2 * 0.5) + (mobileCharging * 0.015 * 0.5);

    // 3. Diet selection impact
    if (strcmp(diet, "vegan") == 0) out->food = 1.1;
    else if (strcmp(diet, "vegetarian") == 0) out->food = 1.9;
    else out->food = 3.6;

    // 4. Waste and recycling loops
    out->waste = (plasticScale * 0.25) + (foodWasteScale * 0.35);
    if (strcmp(recycling, "full") == 0) out->waste -= 0.60;
    else if (strcmp(recycling, "partial") == 0) out->waste -= 0.25;
    if (out->waste < 0.1) out->waste = 0.1;

    out->dailyTotal = out->transport + out->electricity + out->food + out->waste;
    out->yearlyTotal = (out->dailyTotal * 365.0) / 1000.0;

    // Gradings
    if (out->dailyTotal <= 3.0) strcpy(out->grade, "A+");
    else if (out->dailyTotal <= 6.0) strcpy(out->grade, "A");
    else if (out->dailyTotal <= 10.0) strcpy(out->grade, "B");
    else if (out->dailyTotal <= 15.0) strcpy(out->grade, "C");
    else if (out->dailyTotal <= 22.0) strcpy(out->grade, "D");
    else strcpy(out->grade, "F");

    double avgDefault = 14.5;
    out->comparison = (int)(((out->dailyTotal - avgDefault) / avgDefault) * 100.0);
}

int main(int argc, char* argv[]) {
    if (argc < 13) {
        // Print usage as fallback JSON output if arguments are insufficient
        printf("{\"error\": \"Usage: ./calculator <vehicle> <distance> <fuel> <ac> <fan> <tv> <computer> <mobile> <diet> <plastic> <waste> <recycling>\", \"engine\": \"C Engine Core Error\"}\n");
        return 1;
    }

    char* vehicle = argv[1];
    double distance = atof(argv[2]);
    char* fuel = argv[3];
    double ac = atof(argv[4]);
    double fan = atof(argv[5]);
    double tv = atof(argv[6]);
    double computer = atof(argv[7]);
    double mobile = atof(argv[8]);
    char* diet = argv[9];
    double plasticScale = atof(argv[10]);
    double foodWasteScale = atof(argv[11]);
    char* recycling = argv[12];

    CarbonMetric metric;
    calculate_carbon(vehicle, distance, fuel, ac, fan, tv, computer, mobile, diet, plasticScale, foodWasteScale, recycling, &metric);

    // Print values in high stability JSON format
    printf("{\n");
    printf("  \"engine\": \"C Embedded IoT Core\",\n");
    printf("  \"score\": %.2f,\n", metric.dailyTotal);
    printf("  \"yearlyScore\": %.2f,\n", metric.yearlyTotal);
    printf("  \"grade\": \"%s\",\n", metric.grade);
    printf("  \"comparisonPercent\": %d,\n", metric.comparison);
    printf("  \"breakdown\": {\n");
    printf("    \"transport\": %.2f,\n", metric.transport);
    printf("    \"electricity\": %.2f,\n", metric.electricity);
    printf("    \"food\": %.2f,\n", metric.food);
    printf("    \"waste\": %.2f\n", metric.waste);
    printf("  }\n");
    printf("}\n");

    return 0;
}
