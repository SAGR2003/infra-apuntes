function calculateAvailability(mtbf, mttr, replicas) {
  let availability = mtbf / (mtbf + mttr);
  return 1 - Math.pow(1 - availability, replicas);
}

function generateCombinations(systems, minAvailability) {
  let options = [];
  let replicaLimits = Array(systems.length).fill([...Array(10).keys()].map(i => i + 1));

  function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])), [[]]);
  }

  let combinations = cartesianProduct(replicaLimits);

  for (let combination of combinations) {
    let totalAvailability = 1;
    let totalCost = 0;
    let systemReplicas = {};

    systems.forEach(([name, mtbf, mttr, costPerReplica], i) => {
      let replicas = combination[i];
      systemReplicas[name] = replicas;
      let systemAvailability = calculateAvailability(mtbf, mttr, replicas);
      totalAvailability *= (1 - (1 - systemAvailability));
      totalCost += replicas * costPerReplica;
    });

    if (totalAvailability >= minAvailability) {
      options.push({ systemReplicas, totalAvailability: totalAvailability.toFixed(15), totalCost });
    }
  }

  return options.sort((a, b) => a.totalCost - b.totalCost).slice(0, 10);
}

const systems = [
  ["SIEM", 26280, 192, 20000],
  ["FIREWALL", 35040, 120, 10000],
  ["Application Server", 52560, 8, 2000],
  ["Storage Server", 43800, 8, 1500]
];

const minAvailability = 0.999981;
const bestOptions = generateCombinations(systems, minAvailability);

console.table(bestOptions);
