#!/bin/bash

echo "Starting Exam Hub..."
echo

echo "Starting Server..."
cd server
npm run dev &
SERVER_PID=$!

echo
echo "Starting Client..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo
echo "Both servers are starting:"
echo "Server: http://localhost:3001"
echo "Client: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
