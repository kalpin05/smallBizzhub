import { useState } from "react";
import "../styles/businessAddProduct.css";
import { useNavigate } from "react-router-dom";
function BusinessAddProduct() {

  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null
  });

  function handleChange(e) {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  }

  function handleImage(e) {
    setProduct({
      ...product,
      image: e.target.files[0]
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!product.name || !product.price || !product.stock) {
      alert("Please fill all required fields");
      return;
    }

    alert("Product Added Successfully!");

    // Later: Send to backend
    console.log(product);
  }

  return (
    <div className="add-product-container">


      {/* HEADER */}
      <header className="add-header">

        <h2>SmallBizHub</h2>

        <nav>
          <span>Home</span>
          <span>Services</span>
          <span>Support</span>
          <span>Contact</span>
        </nav>

        <button className="logout-btn">Logout</button>

      </header>


      {/* LAYOUT */}
      <div className="add-layout">


        {/* SIDEBAR */}
        <aside className="add-sidebar">

          <button onClick={() => navigate("/business-dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/business-profile")}>My Profile</button>
          <button className="active">Products</button>
          <button>Orders</button>
          <button>Analytics</button>
          <button>Settings</button>

        </aside>


        {/* MAIN */}
        <main className="add-main">

          <h1>Add Product</h1>


          {/* FORM CARD */}
          <section className="add-card">

            <form onSubmit={handleSubmit} className="add-form">


              {/* IMAGE UPLOAD */}
              <div className="image-upload">

                <label className="upload-box">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    hidden
                  />

                  {product.image ? (
                    <img
                      src={URL.createObjectURL(product.image)}
                      alt="preview"
                    />
                  ) : (
                    <>
                      <span className="cloud">☁</span>
                      <p>Upload Image</p>
                      <small>JPG, PNG, GIF (Max 5MB)</small>
                      <button type="button">Choose File</button>
                    </>
                  )}

                </label>

              </div>


              {/* DETAILS */}
              <div className="product-details">


                <div className="form-group">
                  <label>Product Name</label>

                  <input
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                  />
                </div>


                <div className="price-stock">

                  <div className="form-group">
                    <label>Price</label>

                    <input
                      name="price"
                      type="number"
                      value={product.price}
                      onChange={handleChange}
                    />
                  </div>


                  <div className="form-group">
                    <label>Stock</label>

                    <input
                      name="stock"
                      type="number"
                      value={product.stock}
                      onChange={handleChange}
                    />
                  </div>

                </div>


                {/* BUTTONS */}
                <div className="form-actions">

                  <button type="submit" className="add-btn">
                    Add Product
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                  >
                    Cancel
                  </button>

                </div>


              </div>

            </form>

          </section>

        </main>

      </div>


      {/* FOOTER */}
      <footer className="add-footer">

        <p>
          Privacy Policy | Terms of Service | Help
        </p>

      </footer>

    </div>
  );
}

export default BusinessAddProduct;
