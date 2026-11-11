
import React, { useState, useEffect } from "react";
import "./App.css";

const ADMIN = {
  username: "admin",
  password: "admin123"
};

function App() {
  const [role, setRole] = useState("user");
  const [page, setPage] = useState("Dashboard");
  const [account, setAccount] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState(
    () => JSON.parse(localStorage.getItem("resqUsers")) || []
  );

  const [reports, setReports] = useState(
    () => JSON.parse(localStorage.getItem("resqReports")) || []
  );

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    username: "",
    password: ""
  });

  const [reportData, setReportData] = useState({
    title: "",
    type: "Fire",
    location: "",
    description: "",
    image: ""
  });

  // Save data in LocalStorage
  useEffect(() => {
    localStorage.setItem("resqUsers", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("resqReports", JSON.stringify(reports));
  }, [reports]);

  // Login
  const login = (e) => {
    e.preventDefault();
    setError("");

    const { username, password } = loginData;

    if (
      role === "admin" &&
      username === ADMIN.username &&
      password === ADMIN.password
    ) {
      setAccount({ username: "admin", name: "Administrator" });
      setPage("Dashboard");
      return;
    }

    if (
      role === "user" &&
      username === "user" &&
      password === "user123"
    ) {
      setAccount({ username: "user", name: "Demo User" });
      setPage("Dashboard");
      return;
    }

    const foundUser = users.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (role === "user" && foundUser) {
      setAccount(foundUser);
      setPage("Dashboard");
    } else {
      setError("Invalid username or password!");
    }
  };

  // Registration
  const signup = (e) => {
    e.preventDefault();

    if (
      !signupData.name ||
      !signupData.username ||
      !signupData.password
    ) {
      setError("Please fill all fields!");
      return;
    }

    if (
      signupData.username === "admin" ||
      signupData.username === "user" ||
      users.some((u) => u.username === signupData.username)
    ) {
      setError("Username already exists!");
      return;
    }

    const newUser = { ...signupData };

    setUsers([...users, newUser]);
    setAccount(newUser);
    setPage("Dashboard");
    setIsSignup(false);
    setError("");
  };

  // Logout
  const logout = () => {
    setAccount(null);
    setLoginData({ username: "", password: "" });
    setPage("Dashboard");
  };

  // Image upload
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setReportData({
        ...reportData,
        image: reader.result
      });
    };

    reader.readAsDataURL(file);
  };

  // Submit emergency report
  const submitReport = (e) => {
    e.preventDefault();

    if (
      !reportData.title ||
      !reportData.location ||
      !reportData.description
    ) {
      alert("Please fill all required fields!");
      return;
    }

    const newReport = {
      ...reportData,
      id: Date.now(),
      username: account.username,
      reporter: account.name,
      status: "Pending",
      date: new Date().toLocaleString()
    };

    setReports([newReport, ...reports]);

    setReportData({
      title: "",
      type: "Fire",
      location: "",
      description: "",
      image: ""
    });

    alert("Emergency report submitted successfully!");
    setPage("Incident Reports");
  };

  // Update report status (Admin)
  const updateStatus = (id, status) => {
    setReports(
      reports.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );
  };

  // Delete report (Admin)
  const deleteReport = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      setReports((prev) =>
        prev.filter((report) => report.id !== id)
      );
    }
  };

  // Delete registered user (Admin)
  const deleteUser = (username) => {
    if (username === "user" || username === "admin") {
      alert("Demo accounts cannot be deleted!");
      return;
    }

    if (window.confirm("Delete this user and all their reports?")) {
      setUsers((prev) =>
        prev.filter((user) => user.username !== username)
      );

      setReports((prev) =>
        prev.filter((report) => report.username !== username)
      );
    }
  };

  // Protect demo accounts from deletion
  const visibleReports =
    account?.username === "admin"
      ? reports
      : reports.filter(
          (report) => report.username === account?.username
        );

  const stats = [
    {
      title: "Total Reports",
      value: reports.length,
      icon: "📋"
    },
    {
      title: "Pending",
      value: reports.filter((r) => r.status === "Pending").length,
      icon: "⏳"
    },
    {
      title: "In Progress",
      value: reports.filter((r) => r.status === "In Progress").length,
      icon: "🚧"
    },
    {
      title: "Resolved",
      value: reports.filter((r) => r.status === "Resolved").length,
      icon: "✅"
    }
  ];

  // Login screen
  if (!account) {
    return (
      <div className="login-page">
        <div className="login-left">
          <h1>🚨 Disaster Management System</h1>
          <h2>Emergency Response Platform</h2>
          <p>
            Report emergencies, track incidents and
            support disaster response activities.
          </p>
        </div>

        <div className="login-box">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p>
            {isSignup
              ? "Register as a new user"
              : "Login to continue"}
          </p>

          <div className="role-buttons">
            <button
              type="button"
              onClick={() => {
                setRole("user");
                setError("");
              }}
              className={role === "user" ? "active" : ""}
            >
              User
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setIsSignup(false);
                setError("");
              }}
              className={role === "admin" ? "active" : ""}
            >
              Admin
            </button>
          </div>

          {isSignup ? (
            <form onSubmit={signup}>
              <input
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    name: e.target.value
                  })
                }
              />

              <input
                placeholder="Username"
                value={signupData.username}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    username: e.target.value
                  })
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    password: e.target.value
                  })
                }
              />

              <button type="submit">Register</button>
            </form>
          ) : (
            <form onSubmit={login}>
              <input
                placeholder="Username"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    username: e.target.value
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value
                  })
                }
                required
              />

              <button type="submit">Login</button>
            </form>
          )}

          {error && <p className="error">{error}</p>}

          {role === "user" && (
            <p className="signup-link">
              {isSignup
                ? "Already have an account?"
                : "New user?"}

              <span
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
              >
                {isSignup ? " Login" : " Register"}
              </span>
            </p>
          )}

          <p className="demo-login">
            User: user / user123
            <br />
            Admin: admin / admin123
          </p>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>🚨 Emergency System</h2>

        <p className="profile">
          {account.name}
          <br />
          <small>{account.username}</small>
          <br />
          <small>{role.toUpperCase()}</small>
        </p>

        {[
          "Dashboard",
          "Report Emergency",
          "Incident Reports",
          "Resources",
          "Alerts",
          "Contacts",
          ...(role === "admin" ? ["Manage Users"] : [])
        ].map((item) => (
          <button
            key={item}
            className={page === item ? "selected" : ""}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>{page}</h1>
          <span>{role === "admin" ? "Administrator" : "User"}</span>
        </header>

        {/* Dashboard */}
        {page === "Dashboard" && (
          <>
            <div className="welcome">
              <h2>
                Welcome, {account.name}!
              </h2>
              <p>
                Disaster Management and Emergency Response Dashboard
              </p>
            </div>

            <div className="stats-grid">
              {(role === "admin"
                ? stats
                : [
                    {
                      title: "My Reports",
                      value: visibleReports.length,
                      icon: "📋"
                    },
                    {
                      title: "Pending",
                      value: visibleReports.filter(
                        (r) => r.status === "Pending"
                      ).length,
                      icon: "⏳"
                    },
                    {
                      title: "In Progress",
                      value: visibleReports.filter(
                        (r) => r.status === "In Progress"
                      ).length,
                      icon: "🚧"
                    },
                    {
                      title: "Resolved",
                      value: visibleReports.filter(
                        (r) => r.status === "Resolved"
                      ).length,
                      icon: "✅"
                    }
                  ]
              ).map((stat) => (
                <div className="stat-card" key={stat.title}>
                  <h2>{stat.icon}</h2>
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                </div>
              ))}
            </div>

            <section className="content-card">
              <h2>Recent Incident Reports</h2>

              {visibleReports.length === 0 ? (
                <p>No reports available.</p>
              ) : (
                visibleReports.slice(0, 5).map((report) => (
                  <div className="report-item" key={report.id}>
                    <h3>{report.title}</h3>
                    <p>{report.location}</p>
                    <span>{report.status}</span>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* Report Emergency */}
        {page === "Report Emergency" && (
          <section className="content-card">
            <h2>Submit Emergency Report</h2>

            <form onSubmit={submitReport} className="report-form">
              <label>Incident Title</label>
              <input
                placeholder="Enter incident title"
                value={reportData.title}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    title: e.target.value
                  })
                }
                required
              />

              <label>Incident Type</label>
              <select
                value={reportData.type}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    type: e.target.value
                  })
                }
              >
                <option>Fire</option>
                <option>Flood</option>
                <option>Earthquake</option>
                <option>Cyclone</option>
                <option>Landslide</option>
                <option>Accident</option>
                <option>Other</option>
              </select>

              <label>Location</label>
              <input
                placeholder="Enter incident location"
                value={reportData.location}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    location: e.target.value
                  })
                }
                required
              />

              <label>Description</label>
              <textarea
                placeholder="Describe the emergency"
                value={reportData.description}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    description: e.target.value
                  })
                }
                required
              />

              <label>Upload Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
              />

              <button type="submit">
                Submit Report
              </button>
            </form>
          </section>
        )}

        {/* Incident Reports */}
        {page === "Incident Reports" && (
          <section className="content-card">
            <h2>Incident Reports</h2>

            {visibleReports.length === 0 ? (
              <p>No incident reports found.</p>
            ) : (
              visibleReports.map((report) => (
                <div className="report-item" key={report.id}>
                  <h3>{report.title}</h3>
                  <p>Type: {report.type}</p>
                  <p>Location: {report.location}</p>
                  <p>Description: {report.description}</p>
                  <p>Reported by: {report.reporter}</p>
                  <p>Date: {report.date}</p>

                  {report.image && (
                    <img
                      src={report.image}
                      alt="Incident"
                      className="report-image"
                    />
                  )}

                  <p>
                    Status: <strong>{report.status}</strong>
                  </p>

                  {role === "admin" && (
                    <>
                      <select
                        value={report.status}
                        onChange={(e) =>
                          updateStatus(report.id, e.target.value)
                        }
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>

                      <button
                        className="delete-btn"
                        onClick={() => deleteReport(report.id)}
                      >
                        🗑 Delete Report
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {/* Resources */}
        {page === "Resources" && (
          <section className="content-card">
            <h2>Emergency Resources</h2>

            <div className="resource-grid">
              {[
                ["🚑", "Medical Assistance", "First aid and ambulance support"],
                ["🚒", "Fire Services", "Fire rescue and safety support"],
                ["🏠", "Shelter", "Temporary safe accommodation"],
                ["🍱", "Food & Water", "Emergency food and water supplies"],
                ["🛟", "Rescue Teams", "Search and rescue assistance"],
                ["💊", "Medicines", "Emergency medical supplies"]
              ].map((item) => (
                <div className="resource-card" key={item[1]}>
                  <h2>{item[0]}</h2>
                  <h3>{item[1]}</h3>
                  <p>{item[2]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Alerts */}
        {page === "Alerts" && (
          <section className="content-card">
            <h2>Emergency Alerts</h2>

            <div className="alert-item">
              <h3>⚠️ Weather Advisory</h3>
              <p>Stay alert during severe weather conditions.</p>
            </div>

            <div className="alert-item">
              <h3>🌧️ Flood Safety</h3>
              <p>Avoid flooded roads and low-lying areas.</p>
            </div>

            <div className="alert-item">
              <h3>🔥 Fire Safety</h3>
              <p>Keep away from fire-affected areas.</p>
            </div>

            <p>
              These are sample alerts for demonstration,
              not live emergency notifications.
            </p>
          </section>
        )}

        {/* Contacts */}
        {page === "Contacts" && (
          <section className="content-card">
            <h2>Emergency Contact Numbers - India</h2>

            {[
              ["112", "National Emergency Number"],
              ["101", "Fire Services"],
              ["102", "Ambulance"],
              ["108", "Emergency Ambulance"],
              ["100", "Police"]
            ].map((contact) => (
              <div className="contact-item" key={contact[0]}>
                <h3>{contact[0]}</h3>
                <p>{contact[1]}</p>
              </div>
            ))}
          </section>
        )}

        {/* Admin User Management */}
        {page === "Manage Users" && role === "admin" && (
          <section className="content-card">
            <h2>Registered User Management</h2>

            {users.length === 0 ? (
              <p>No registered users found.</p>
            ) : (
              users.map((user) => (
                <div className="report-item" key={user.username}>
                  <h3>{user.name}</h3>
                  <p>Username: {user.username}</p>

                  <p>
                    Reports: {
                      reports.filter(
                        (r) => r.username === user.username
                      ).length
                    }
                  </p>

                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(user.username)}
                  >
                    🗑 Delete User
                  </button>
                </div>
              ))
            )}
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
