import http from "k6/http";
import { check } from "k6";

export const options = {
    scenarios: {
        notification_test: {
            executor: "constant-arrival-rate",
            rate: 100,
            timeUnit: "1s",
            duration: "30s",
            preAllocatedVUs: 10,
            maxVUs: 50,
        },
    },
};

export default function () {
    const payload = JSON.stringify({
        userId: `load-test-user-${__VU}-${__ITER}`,
        message: "Performance test notification",
        channel: "email",
    });

    const response = http.post(
        "http://localhost:3000/notify",
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    check(response, {
        "status is 202": (response) => response.status === 202,
    });
}