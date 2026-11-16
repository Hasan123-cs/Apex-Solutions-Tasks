
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Apex Demo")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers together"""
    return a + b

@mcp.tool()
def greet(name: str) -> str:
    """Greet a person by name"""
    return f"Hello {name}, welcome to Apex!"

if __name__ == "__main__":
    mcp.run()
