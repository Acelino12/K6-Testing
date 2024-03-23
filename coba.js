import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
  stages: [
    { duration: '1m', target: 1000 }, // 1000 virtual users for 1 minute
    { duration: '2m', target: 1000 }, // ramp up to 1000 virtual users for 2 minutes
    { duration: '1m', target: 0 },    // ramp down to 0 virtual users for 1 minute
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests must complete below 2000ms
  },
  
};

// Scenario for integration testing
export function integrationTest() {
  let createUserResponse = http.post('https://reqres.in/api/users', {
    name: 'John Doe',
    job: 'Tester'
  });
  check(createUserResponse, {
    'Create User Status is 201': (res) => res.status === 201,
    'Create User Successful': (res) => JSON.parse(res.body).name === 'John Doe',
  });

  let updateUserResponse = http.put('https://reqres.in/api/users/2', {
    name: 'Jane Smith',
    job: 'Developer'
  });
  check(updateUserResponse, {
    'Update User Status is 200': (res) => res.status === 200,
    'Update User Successful': (res) => JSON.parse(res.body).name === 'Jane Smith',
  });
}

// Scenario for performance testing
export function performanceTest() {
  let response = http.get('https://reqres.in/api/users/2');
  check(response, {
    'Response time is less than 2 seconds': (res) => res.timings.duration < 2000,
  });
  sleep(1);
}


// Default function
export default function () {
  integrationTest();
  performanceTest();
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}