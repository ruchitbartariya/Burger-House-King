import { useEffect, useState } from "react";

export const Admin = () => {
  /*
  |--------------------------------------------------------------------------
  | REACT STATE
  |--------------------------------------------------------------------------
  */

  // Stores every order received from the backend.
  const [orders, setOrders] = useState([]);

  // Stores the currently selected order-status filter.
  const [filter, setFilter] = useState("all");

  // Stores the text entered in the search box.
  const [searchTerm, setSearchTerm] = useState("");

  // Stores the currently active pagination page.
  const [currentPage, setCurrentPage] = useState(1);

  // Controls the loading screen.
  const [loading, setLoading] = useState(true);

  // Stores an error message if the API request fails.
  const [error, setError] = useState("");

  // Number of orders displayed on one page.
  const ordersPerPage = 6;

  /*
  |--------------------------------------------------------------------------
  | FETCH ALL ORDERS
  |--------------------------------------------------------------------------
  | Sends GET /api/orders to the backend.
  */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/orders");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch orders");
      }

      // Save the orders returned by MongoDB into React state.
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(err.message || "Something went wrong");
    } finally {
      // This runs whether the API succeeds or fails.
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH ORDERS WHEN ADMIN PAGE OPENS
  |--------------------------------------------------------------------------
  | Empty dependency array means this effect runs only once.
  */
  useEffect(() => {
    fetchOrders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RESET PAGINATION
  |--------------------------------------------------------------------------
  | When search text or order-status filter changes, return to page 1.
  |
  | Example:
  | If the admin is on page 4 and selects "Ready", there may be only one page
  | of ready orders. Resetting prevents an empty page.
  */
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER STATUS
  |--------------------------------------------------------------------------
  | Sends PUT /api/orders/status/:id to the backend.
  */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update order status");
        return;
      }

      /*
      Update only the matching order in React state.

      map() checks every order:
      - Matching ID: return an updated copy.
      - Different ID: return the original order.
      */
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: data.order.orderStatus,
                deliveredAt: data.order.deliveredAt,
              }
            : order
        )
      );
    } catch (err) {
      console.error("Update order status error:", err);

      alert("Unable to update order status");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CALCULATE TOTAL ITEM QUANTITY
  |--------------------------------------------------------------------------
  | Example:
  | Burger quantity 2 + Pizza quantity 1 = 3 total items.
  */
  const getTotalQuantity = (items = []) => {
    return items.reduce((total, item) => {
      return total + Number(item.quantity || 0);
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT ORDER DATE
  |--------------------------------------------------------------------------
  | Converts MongoDB date into an Indian-readable date and time.
  */
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | ORDER STATUS COLORS
  |--------------------------------------------------------------------------
  | Returns different Tailwind classes according to the status.
  */
  const getOrderStatusClasses = (status) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "preparing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "ready":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS COLORS
  |--------------------------------------------------------------------------
  */
  const getPaymentStatusClasses = (status) => {
    if (status === "paid") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH AND STATUS FILTERING
  |--------------------------------------------------------------------------
  | An order appears only when:
  | 1. Its status matches the selected filter.
  | 2. Its details match the search text.
  */
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filter === "all" || order.orderStatus === filter;

    const searchValue = searchTerm.toLowerCase().trim();

    const matchesSearch =
      String(order.customerName || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order.email || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order._id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(order.tableNo || "")
        .toLowerCase()
        .includes(searchValue);

    return matchesStatus && matchesSearch;
  });

  /*
  |--------------------------------------------------------------------------
  | PAGINATION CALCULATIONS
  |--------------------------------------------------------------------------
  */

  // Example: 22 orders / 6 per page = 3.67, rounded up to 4 pages.
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Example: page 2 × 6 = 12.
  const indexOfLastOrder = currentPage * ordersPerPage;

  // Example: 12 - 6 = 6.
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  /*
  slice(start, end):
  - Includes the start index.
  - Excludes the end index.

  Page 1: slice(0, 6)
  Page 2: slice(6, 12)
  */
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  /*
  |--------------------------------------------------------------------------
  | FILTER BUTTON DETAILS
  |--------------------------------------------------------------------------
  | This avoids writing six nearly identical buttons manually.
  */
  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Placed", value: "placed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F5EC] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DCCFB8] border-t-[#5A2D20] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#4B2418] mt-5">
            Loading orders...
          </h2>

          <p className="text-[#6D4C41] mt-2">
            Please wait while orders are fetched.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dashboard heading and refresh button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8A5A44]">
              Cafe Management
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold text-[#4B2418] mt-2">
              Admin Dashboard
            </h1>

            <p className="text-[#6D4C41] mt-3">
              View, search and manage customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="self-start md:self-auto bg-[#5A2D20] hover:bg-[#3E1E14] text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Refresh Orders
          </button>
        </div>

        {/* API error message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-xl mb-8">
            <h2 className="font-bold">Unable to load orders</h2>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Search input */}
        <div className="mb-6">
          <label
            htmlFor="order-search"
            className="block text-sm font-bold uppercase tracking-wider text-[#6D4C41] mb-2"
          >
            Search Orders
          </label>

          <input
            id="order-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by customer, email, order ID, or table number"
            className="w-full bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#5A2D20]"
          />
        </div>

        {/* Order-status filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {filterButtons.map((button) => (
            <button
              key={button.value}
              type="button"
              onClick={() => setFilter(button.value)}
              className={`px-5 py-2.5 rounded-full font-bold transition ${
                filter === button.value
                  ? "bg-[#5A2D20] text-white"
                  : "bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] hover:bg-[#EFE7D6]"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Dashboard statistics */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-2xl p-6 shadow-sm">
            <p className="text-[#6D4C41]">Total Orders</p>

            <h2 className="text-4xl font-bold text-[#4B2418] mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-2xl p-6 shadow-sm">
            <p className="text-[#6D4C41]">Placed</p>

            <h2 className="text-4xl font-bold text-blue-700 mt-2">
              {
                orders.filter((order) => order.orderStatus === "placed")
                  .length
              }
            </h2>
          </div>

          <div className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-2xl p-6 shadow-sm">
            <p className="text-[#6D4C41]">Preparing</p>

            <h2 className="text-4xl font-bold text-yellow-700 mt-2">
              {
                orders.filter((order) => order.orderStatus === "preparing")
                  .length
              }
            </h2>
          </div>

          <div className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-2xl p-6 shadow-sm">
            <p className="text-[#6D4C41]">Paid Orders</p>

            <h2 className="text-4xl font-bold text-green-700 mt-2">
              {
                orders.filter((order) => order.paymentStatus === "paid")
                  .length
              }
            </h2>
          </div>
        </section>

        {/* Message shown when the database has no orders */}
        {orders.length === 0 ? (
          <section className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-3xl p-12 text-center shadow-sm">
            <h2 className="text-3xl font-bold text-[#4B2418]">
              No orders found
            </h2>

            <p className="text-[#6D4C41] mt-3">
              New customer orders will appear here.
            </p>
          </section>
        ) : (
          <>
            {/* Current pagination range */}
            {filteredOrders.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5 text-[#6D4C41]">
                <p>
                  Showing{" "}
                  <span className="font-bold text-[#4B2418]">
                    {indexOfFirstOrder + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-[#4B2418]">
                    {Math.min(
                      indexOfLastOrder,
                      filteredOrders.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#4B2418]">
                    {filteredOrders.length}
                  </span>{" "}
                  orders
                </p>

                <p>
                  Page{" "}
                  <span className="font-bold text-[#4B2418]">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#4B2418]">
                    {totalPages}
                  </span>
                </p>
              </div>
            )}

            {/* Order cards */}
            <section className="grid lg:grid-cols-2 gap-6">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full bg-[#FFFDF8] border border-[#DCCFB8] rounded-2xl p-10 text-center">
                  <h2 className="text-2xl font-bold text-[#4B2418]">
                    No matching orders found
                  </h2>

                  <p className="text-[#6D4C41] mt-2">
                    Try another customer name, email, order ID, table
                    number, or status.
                  </p>
                </div>
              ) : (
                currentOrders.map((order) => (
                  <article
                    key={order._id}
                    className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-3xl p-6 shadow-sm"
                  >
                    {/* Order ID, status dropdown and payment badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm text-[#8A5A44] font-semibold">
                          Order ID
                        </p>

                        <p className="text-sm text-[#6D4C41] break-all mt-1">
                          {order._id}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-start gap-3">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`status-${order._id}`}
                            className="text-xs font-bold uppercase tracking-wide text-[#8A5A44]"
                          >
                            Order Status
                          </label>

                          <select
                            id={`status-${order._id}`}
                            value={order.orderStatus || "placed"}
                            onChange={(event) =>
                              updateOrderStatus(
                                order._id,
                                event.target.value
                              )
                            }
                            className={`border px-3 py-2 rounded-xl font-bold capitalize cursor-pointer outline-none ${getOrderStatusClasses(
                              order.orderStatus
                            )}`}
                          >
                            <option value="placed">Placed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <span
                          className={`border px-3 py-2 rounded-xl text-sm font-bold capitalize ${getPaymentStatusClasses(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus || "pending"}
                        </span>
                      </div>
                    </div>

                    {/* Customer and table information */}
                    <div className="border-t border-[#DCCFB8] mt-5 pt-5 grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#8A5A44] font-semibold">
                          Customer
                        </p>

                        <h2 className="text-xl font-bold text-[#4B2418] mt-1">
                          {order.customerName || "Unknown Customer"}
                        </h2>

                        <p className="text-[#6D4C41] mt-1 break-all">
                          {order.email || "No email"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#8A5A44] font-semibold">
                          Table / Order Type
                        </p>

                        <h2 className="text-xl font-bold text-[#4B2418] mt-1">
                          {order.tableNo || "Online Order"}
                        </h2>

                        <p className="text-[#6D4C41] mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ordered items */}
                    <div className="border-t border-[#DCCFB8] mt-5 pt-5">
                      <div className="flex justify-between gap-4 mb-4">
                        <h3 className="text-lg font-bold text-[#4B2418]">
                          Ordered Items
                        </h3>

                        <span className="text-[#6D4C41] font-semibold">
                          {getTotalQuantity(order.items)} item(s)
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={`${order._id}-${item._id || index}`}
                            className="flex justify-between gap-5 bg-[#F8F5EC] border border-[#E7DCC9] rounded-xl p-4"
                          >
                            <div>
                              <h4 className="font-bold text-[#4B2418]">
                                {item.name}
                              </h4>

                              <p className="text-sm text-[#6D4C41] mt-1">
                                ₹{item.price} × {item.quantity}
                              </p>
                            </div>

                            <p className="font-bold text-[#5A2D20] whitespace-nowrap">
                              ₹
                              {Number(item.price) *
                                Number(item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment method and total */}
                    <div className="border-t border-[#DCCFB8] mt-5 pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                      <div>
                        <p className="text-sm text-[#8A5A44] font-semibold">
                          Payment Method
                        </p>

                        <p className="font-bold text-[#4B2418] mt-1">
                          {order.paymentMethod || "Cash"}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm text-[#8A5A44] font-semibold">
                          Total Amount
                        </p>

                        <p className="text-3xl font-bold text-[#5A2D20] mt-1">
                          ₹{order.totalAmount || 0}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>

            {/* Pagination controls appear below the cards */}
            {filteredOrders.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((previousPage) =>
                      Math.max(previousPage - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] px-5 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFE7D6] transition"
                >
                  Previous
                </button>

                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => {
                      const pageNumber = index + 1;

                      return (
                        <button
                          type="button"
                          key={pageNumber}
                          onClick={() =>
                            setCurrentPage(pageNumber)
                          }
                          className={`w-11 h-11 rounded-xl font-bold transition ${
                            currentPage === pageNumber
                              ? "bg-[#5A2D20] text-white"
                              : "bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] hover:bg-[#EFE7D6]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((previousPage) =>
                      Math.min(previousPage + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] px-5 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFE7D6] transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};