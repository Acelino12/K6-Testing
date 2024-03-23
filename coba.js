import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
  stages: [
    { duration: '1m', target: 1000 }, 
    { duration: '2m', target: 1000 }, 
    { duration: '1m', target: 0 },    
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], 
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