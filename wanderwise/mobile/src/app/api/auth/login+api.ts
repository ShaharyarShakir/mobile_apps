export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "BFF Internal Error" },
      { status: 500 }
    );
  }
}
