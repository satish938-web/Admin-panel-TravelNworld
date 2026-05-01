import { useEffect, useState } from "react";
import axios from "axios";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({
    title: "",
    link: "",
    position: "top",
    order: 0,
  });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

const fetchBanners = async () => {
  try {
    const res = await axios.get("/api/banners?position=top");
    setBanners(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Fetch error:", err.response?.data || err.message);
  }
};

  useEffect(() => {
    fetchBanners();
  }, []);

  // CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "";
      if (image) {
        const { uploadToS3 } = await import("../utils/s3Upload");
        imageUrl = await uploadToS3(image, "banners");
      }

      const bannerData = {
        ...form,
        imageUrl: imageUrl || undefined
      };

      if (editingId) {
        await axios.put(`/api/banners/${editingId}`, bannerData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEditingId(null);
      } else {
        await axios.post(`/api/banners`, bannerData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      setForm({ title: "", link: "", position: "top", order: 0 });
      setImage(null);
      fetchBanners();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
   await axios.delete(`/api/banners/${id}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
    fetchBanners();
  };

  // TOGGLE
  const handleToggle = async (id) => {
   await axios.patch(`/api/banners/${id}/toggle`, {}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
    fetchBanners();
  };

  // EDIT
  const handleEdit = (banner) => {
    setForm({
      title: banner.title,
      link: banner.link,
      position: banner.position,
      order: banner.order,
    });
    setEditingId(banner._id);
  };

  return (
    <div>
      <h2>{editingId ? "Edit Banner" : "Add Banner"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Link"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />

        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
        />

        <select
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        >
          <option value="top">Top</option>
          <option value="middle">Middle</option>
        </select>

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      <h2>All Banners</h2>

      {Array.isArray(banners) && banners.map((b) => (
        <div key={b._id} style={{ border: "1px solid gray", margin: 10 }}>
          <img src={b.imageUrl} width="200" />
          <p>{b.title}</p>
          <p>Position: {b.position}</p>
          <p>Status: {b.isActive ? "Active" : "Inactive"}</p>

          <button onClick={() => handleEdit(b)}>Edit</button>
          <button onClick={() => handleDelete(b._id)}>Delete</button>
          <button onClick={() => handleToggle(b._id)}>
            Toggle
          </button>
        </div>
      ))}
    </div>
  );
};

export default BannerManagement;