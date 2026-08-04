export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    const response = await fetch("http://localhost:8080/auth/me", {
      method: "GET",
      headers: {
        "Authorization": authHeader || "",
        "Content-Type": "application/json",
      },
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
