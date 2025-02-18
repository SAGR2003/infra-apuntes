from itertools import product
import pandas as pd
from tabulate import tabulate

def calculate_availability(mtbf, mttr, replicas):
    availability = mtbf / (mtbf + mttr)
    return 1 - (1 - availability) ** replicas

def generate_combinations(systems, min_availability):
    options = []
    replica_limits = [range(1, 11)] * len(systems)  # Simplified list comprehension
    
    for combination in product(*replica_limits):
        total_availability = 1
        total_cost = 0
        system_replicas = {}
        
        for (name, mtbf, mttr, cost_per_replica), replicas in zip(systems, combination):
            system_replicas[name] = replicas
            system_availability = calculate_availability(mtbf, mttr, replicas)
            total_availability *= (1 - (1 - system_availability))
            total_cost += replicas * cost_per_replica
        
        if total_availability >= min_availability:
            options.append((system_replicas, f"{total_availability:.15f}", total_cost))
    
    return sorted(options, key=lambda x: x[2])[:10]

systems = [
    ("SIEM", 26280, 192, 20000),
    ("FIREWALL", 35040, 120, 10000),
    ("Application Server", 52560, 8, 2000),
    ("Storage Server", 43800, 8, 1500)
]

min_availability = 0.999981
best_options = generate_combinations(systems, min_availability)

df_results = pd.DataFrame(best_options, columns=["Replicas per system", "Total availability", "Total cost"])
df_results.index += 1

print(tabulate(df_results, headers='keys', tablefmt='fancy_grid', showindex=True))
