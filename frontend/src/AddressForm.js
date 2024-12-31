import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddressForm = () => {
  const [location, setLocation] = useState({ lat: 20.536846, lng: 76.180870 });
  const [houseNumber, setHouseNumber] = useState('');
  const [road, setRoad] = useState('');
  const [category, setCategory] = useState('Home');
  const [addresses, setAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const fetchAddress = async (lat, lng) => {
    const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ`;
  
    try {
      const response = await fetch(geocodingApiUrl);
      const data = await response.json();
  
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        throw new Error("No address found");
      }
    } catch (error) {
      console.error("Error:", error);
      return "Unable to fetch address";
    }
  };

  const requestGeolocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(currentLocation);
          setPermissionGranted(true);
          setShowModal(false);

          const address = await fetchAddress(currentLocation.lat, currentLocation.lng);
        },
        () => {
          toast.error("Permission denied");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
    setPermissionRequested(true);
  };

  useEffect(() => {
    if (!permissionRequested) {
      setShowModal(true);
    }
    fetchAddresses();
  }, [permissionRequested]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/addresses');
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      toast.error('Error fetching addresses');
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      houseNumber,
      road,
      category,
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      let response;
      if (isUpdating) {
        response = await fetch(`http://localhost:5000/api/addresses/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('http://localhost:5000/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();
      if (response.ok) {
        toast.success('Address saved successfully!');
        fetchAddresses();
        setHouseNumber('');
        setRoad('');
        setCategory('Home');
        setIsUpdating(false);
        setCurrentId(null);
      } else {
        toast.error('Failed to save address');
      }
    } catch (err) {
      toast.error('Error saving address');
    }
  };

  const handleSearchManually = () => {
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (err) {
      toast.error('Error deleting address');
    }
  };

  const handleEdit = (address) => {
    setHouseNumber(address.houseNumber);
    setRoad(address.road);
    setCategory(address.category);
    setLocation({ lat: address.latitude, lng: address.longitude });
    setIsUpdating(true);
    setCurrentId(address.id);
  };

  const filteredAddresses = addresses.filter((address) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      address.houseNumber.toLowerCase().includes(searchTerm) ||
      address.road.toLowerCase().includes(searchTerm) ||
      address.category.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div style={styles.container}>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeader}>Enable Location</h3>
            <p style={styles.modalText}>We need your location to update the delivery address.</p>
            <div>
              <button onClick={handleSearchManually} style={styles.secondaryButton}>Search Manually</button>
              <button onClick={requestGeolocationPermission} style={styles.primaryButton}>Enable Location</button>
            </div>
          </div>
        </div>
      )}

      <h2 style={styles.header}>Delivery Address Form</h2>

      {permissionGranted && (
        <div style={styles.mapContainer}>
          <LoadScript googleMapsApiKey="AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ">
            <GoogleMap
              mapContainerStyle={styles.map}
              center={location}
              zoom={15}
              onClick={(e) => handleLocationChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
            >
              <Marker position={location} />
            </GoogleMap>
          </LoadScript>
          <p style={styles.locationText}>Selected Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>House/Flat/Block No.:</label>
          <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} required style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Apartment/Road/Area:</label>
          <input type="text" value={road} onChange={(e) => setRoad(e.target.value)} required style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Category:</label>
          <div style={styles.radioGroup}>
            {['Home', 'Office', 'Friends & Family'].map((cat) => (
              <label key={cat} style={styles.radioLabel}>
                <input type="radio" name="category" value={cat} checked={category === cat} onChange={() => setCategory(cat)} style={styles.radioInput} />
                {cat}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" style={styles.submitButton}>{isUpdating ? 'Update Address' : 'Save Address'}</button>
      </form>

      <div style={styles.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Pincode, Area, or Apartment"
          style={styles.searchInput}
        />
      </div>

      <h2 style={styles.subHeader}>Saved Addresses</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>House Number</th>
            <th>Apartment/Road/Area</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAddresses.map((address) => (
            <tr key={address.id}>
              <td>{address.houseNumber}</td>
              <td>{address.road}</td>
              <td>{address.category}</td>
              <td>
                <button onClick={() => handleEdit(address)} style={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(address.id)} style={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
};

// Enhanced styles
const styles = {
  container: {
    fontFamily: 'Roboto, sans-serif',
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#333',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  modalHeader: {
    fontSize: '20px',
    marginBottom: '10px',
  },
  modalText: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  primaryButton: {
    padding: '12px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
  },
  secondaryButton: {
    padding: '12px 20px',
    backgroundColor: '#f4f4f4',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  mapContainer: {
    marginBottom: '20px',
  },
  map: {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
  },
  locationText: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#555',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  searchBar: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
  },
  subHeader: {
    fontSize: '24px',
    marginTop: '20px',
    marginBottom: '10px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center', 
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontSize: '16px',
    padding: '12px',
    textAlign: 'center', // Center align the header text
    border: '1px solid #ddd', // Add border to header
  },
  tableCell: {
    padding: '12px',
    textAlign: 'center', // Center align the table data
    border: '1px solid #ddd', // Add border to table cells
  },
  editButton: {
    padding: '8px 12px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    marginRight: '10px',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#FF5733',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },

  // table: {
  //   width: '100%',
  //   borderCollapse: 'collapse',
  //   marginTop: '20px',
  // },
  // tableHeader: {
  //   backgroundColor: '#f4f4f4',
  //   fontSize: '16px',
  //   padding: '12px',
  //   textAlign: 'left',
  // },
  // tableCell: {
  //   padding: '12px',
  //   borderBottom: '1px solid #ddd',
  // },
  // editButton: {
  //   padding: '8px 12px',
  //   backgroundColor: '#007BFF',
  //   color: 'white',
  //   border: 'none',
  //   cursor: 'pointer',
  //   borderRadius: '4px',
  //   marginRight: '10px',
  // },
  // deleteButton: {
  //   padding: '8px 12px',
  //   backgroundColor: '#FF5733',
  //   color: 'white',
  //   border: 'none',
  //   cursor: 'pointer',
  //   borderRadius: '4px',
  // },
};

export default AddressForm;


// import React, { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AddressForm = () => {
//   const [location, setLocation] = useState({ lat: 20.536846, lng: 76.180870 });
//   const [houseNumber, setHouseNumber] = useState('');
//   const [road, setRoad] = useState('');
//   const [category, setCategory] = useState('Home');
//   const [addresses, setAddresses] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(''); // New state for search query
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [permissionRequested, setPermissionRequested] = useState(false);
//   const [showModal, setShowModal] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);  // Track if it's an update
//   const [currentId, setCurrentId] = useState(null);  // To track the current address being updated

//   const fetchAddress = async (lat, lng) => {
//     const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ`;
  
//     try {
//       const response = await fetch(geocodingApiUrl);
//       const data = await response.json();
  
//       if (data.status === "OK" && data.results.length > 0) {
//         return data.results[0].formatted_address; // Return the first formatted address
//       } else {
//         throw new Error("No address found for the given location");
//       }
//     } catch (error) {
//       console.error("Error fetching address:", error);
//       return "Unable to fetch address";
//     }
//   };
  
//   const requestGeolocationPermission = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const currentLocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setLocation(currentLocation);
//           setPermissionGranted(true);
//           setShowModal(false); // Hide the modal
  
//           // Fetch and display the address
//           const address = await fetchAddress(currentLocation.lat, currentLocation.lng);
//         },
//         (error) => {
//           toast.error("Geolocation permission denied or failed");
//         }
//       );
//     } else {
//       toast.error("Geolocation is not supported by your browser");
//     }
//     setPermissionRequested(true);
//   };
  

//   useEffect(() => {
//     if (!permissionRequested) {
//       setShowModal(true);
//     }
//     fetchAddresses();
//   }, [permissionRequested]);

//   // Fetch saved addresses from the API
//   const fetchAddresses = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/addresses');
//       const data = await response.json();
//       setAddresses(data);
//     } catch (err) {
//       toast.error('An error occurred while fetching addresses');
//     }
//   };

//   const handleLocationChange = (newLocation) => {
//     setLocation(newLocation);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = {
//       houseNumber,
//       road,
//       category,
//       latitude: location.lat,
//       longitude: location.lng,
//     };

//     try {
//       let response;
//       if (isUpdating) {
//         // Update address
//         response = await fetch(`http://localhost:5000/api/addresses/${currentId}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData),
//         });
//       } else {
//         // Create new address
//         response = await fetch('http://localhost:5000/api/addresses', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData),
//         });
//       }

//       const data = await response.json();
//       if (response.ok) {
//         toast.success('Address saved successfully!');
//         fetchAddresses();  // Re-fetch the addresses after adding or updating
//         setHouseNumber('');
//         setRoad('');
//         setCategory('Home');
//         setIsUpdating(false);  // Reset the update state
//         setCurrentId(null);
//       } else {
//         toast.error('Failed to save address');
//       }
//     } catch (err) {
//       toast.error('An error occurred while saving the address');
//     }
//   };

//   const handleEnableLocation = () => {
//     requestGeolocationPermission();
//   };

//   const handleSearchManually = () => {
//     setShowModal(false);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/addresses/${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         toast.success('Address deleted successfully');
//         fetchAddresses();  // Re-fetch the addresses after deletion
//       } else {
//         toast.error('Failed to delete address');
//       }
//     } catch (err) {
//       toast.error('An error occurred while deleting the address');
//     }
//   };

//   const handleEdit = (address) => {
//     setHouseNumber(address.houseNumber);
//     setRoad(address.road);
//     setCategory(address.category);
//     setLocation({ lat: address.latitude, lng: address.longitude });
//     setIsUpdating(true);
//     setCurrentId(address.id);  // Set the current address ID
//   };

//   // Filter addresses based on the search query
//   const filteredAddresses = addresses.filter((address) => {
//     const searchTerm = searchQuery.toLowerCase();
//     return (
//       address.houseNumber.toLowerCase().includes(searchTerm) ||
//       address.road.toLowerCase().includes(searchTerm) ||
//       address.category.toLowerCase().includes(searchTerm)
//     );
//   });

//   return (
//     <div style={styles.container}>
//       {/* Modal */}
//       {showModal && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modalContent}>
//             <h3>Your Location Permission</h3>
//             <p>We need access to your location to update the delivery address.</p>
//             <div>
//               <button onClick={handleEnableLocation} style={styles.primaryButton}>
//                 Enable Location
//               </button>
//               <button onClick={handleSearchManually} style={styles.secondaryButton}>
//                 Search Manually
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <h2 style={styles.header}>Delivery Address Form</h2>

//       {permissionGranted && (
//         <div style={styles.mapContainer}>
//           <LoadScript googleMapsApiKey="AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ">
//             <GoogleMap
//               mapContainerStyle={styles.map}
//               center={location}
//               zoom={15}
//               onClick={(event) => {
//                 const latLng = event.latLng;
//                 handleLocationChange({ lat: latLng.lat(), lng: latLng.lng() });
//               }}
//             >
//               <Marker position={location} />
//             </GoogleMap>
//           </LoadScript>
//           <p>Selected Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} style={styles.form}>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>House/Flat/Block No.:</label>
//           <input
//             type="text"
//             value={houseNumber}
//             onChange={(e) => setHouseNumber(e.target.value)}
//             required
//             style={styles.input}
//           />
//         </div>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Apartment/Road/Area:</label>
//           <input
//             type="text"
//             value={road}
//             onChange={(e) => setRoad(e.target.value)}
//             required
//             style={styles.input}
//           />
//         </div>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Category:</label>
//           <div style={styles.radioGroup}>
//             {['Home', 'Office', 'Friends & Family'].map((cat) => (
//               <label key={cat} style={styles.radioLabel}>
//                 <input
//                   type="radio"
//                   name="category"
//                   value={cat}
//                   checked={category === cat}
//                   onChange={() => setCategory(cat)}
//                   style={styles.radioInput}
//                 />
//                 {cat}
//               </label>
//             ))}
//           </div>
//         </div>
//         <button type="submit" style={styles.submitButton}>
//           {isUpdating ? 'Update Address' : 'Save Address'}
//         </button>
//       </form>

//       {/* Search Bar */}
//       <div style={styles.inputGroup}>
//         <label style={styles.label}>Search Addresses:</label>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search by Pincode, Area, or Apartment"
//           style={styles.input}
//         />
//       </div>

//       <h2 style={styles.subHeader}>Saved Addresses</h2>

//       {/* Table for displaying addresses */}
//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th>House Number</th>
//             <th>Apartment/Road/Area</th>
//             <th>Category</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredAddresses.map((address) => (
//             <tr key={address.id}>
//               <td>{address.houseNumber}</td>
//               <td>{address.road}</td>
//               <td>{address.category}</td>
//               <td>
//                 <button
//                   onClick={() => handleEdit(address)}
//                   style={styles.editButton}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(address.id)}
//                   style={styles.deleteButton}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <ToastContainer />
//     </div>
//   );
// };

// // Styles for the components
// const styles = {
//   container: {
//     fontFamily: 'Arial, sans-serif',
//     padding: '20px',
//   },
//   header: {
//     fontSize: '24px',
//     marginBottom: '20px',
//   },
//   mapContainer: {
//     marginBottom: '20px',
//   },
//   map: {
//     width: '100%',
//     height: '400px',
//   },
//   form: {
//     marginBottom: '20px',
//   },
//   inputGroup: {
//     marginBottom: '10px',
//   },
//   label: {
//     display: 'block',
//     marginBottom: '5px',
//     fontSize: '16px',
//   },
//   input: {
//     width: '100%',
//     padding: '10px',
//     fontSize: '16px',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//   },
//   submitButton: {
//     padding: '10px 20px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     fontSize: '16px',
//   },
//   radioGroup: {
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   radioLabel: {
//     marginBottom: '5px',
//   },
//   radioInput: {
//     marginRight: '10px',
//   },
//   inputGroup: {
//     marginBottom: '10px',
//   },
//   input: {
//     width: '100%',
//     padding: '10px',
//     fontSize: '16px',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//   },
//   submitButton: {
//     padding: '10px 20px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     fontSize: '16px',
//   },
//   editButton: {
//     padding: '5px 10px',
//     backgroundColor: '#007BFF',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     marginRight: '10px',
//   },
//   deleteButton: {
//     padding: '5px 10px',
//     backgroundColor: '#FF5733',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//   },
// };

// export default AddressForm;



// import React, { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AddressForm = () => {
//   const [location, setLocation] = useState({ lat: 20.536846, lng: 76.180870 });
//   const [houseNumber, setHouseNumber] = useState('');
//   const [road, setRoad] = useState('');
//   const [category, setCategory] = useState('Home');
//   const [addresses, setAddresses] = useState([]);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [permissionRequested, setPermissionRequested] = useState(false);
//   const [showModal, setShowModal] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);  // Track if it's an update
//   const [currentId, setCurrentId] = useState(null);  // To track the current address being updated

//   const fetchAddress = async (lat, lng) => {
//     const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ`;
  
//     try {
//       const response = await fetch(geocodingApiUrl);
//       const data = await response.json();
  
//       if (data.status === "OK" && data.results.length > 0) {
//         return data.results[0].formatted_address; // Return the first formatted address
//       } else {
//         throw new Error("No address found for the given location");
//       }
//     } catch (error) {
//       console.error("Error fetching address:", error);
//       return "Unable to fetch address";
//     }
//   };
  
//   const requestGeolocationPermission = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const currentLocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setLocation(currentLocation);
//           setPermissionGranted(true);
//           setShowModal(false); // Hide the modal
  
//           // Fetch and display the address
//           const address = await fetchAddress(currentLocation.lat, currentLocation.lng);
//         },
//         (error) => {
//           toast.error("Geolocation permission denied or failed");
//         }
//       );
//     } else {
//       toast.error("Geolocation is not supported by your browser");
//     }
//     setPermissionRequested(true);
//   };
  

//   useEffect(() => {
//     if (!permissionRequested) {
//       setShowModal(true);
//     }
//     fetchAddresses();
//   }, [permissionRequested]);

//   // Fetch saved addresses from the API
//   const fetchAddresses = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/addresses');
//       const data = await response.json();
//       setAddresses(data);
//     } catch (err) {
//       toast.error('An error occurred while fetching addresses');
//     }
//   };

//   const handleLocationChange = (newLocation) => {
//     setLocation(newLocation);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = {
//       houseNumber,
//       road,
//       category,
//       latitude: location.lat,
//       longitude: location.lng,
//     };

//     try {
//       let response;
//       if (isUpdating) {
//         // Update address
//         response = await fetch(`http://localhost:5000/api/addresses/${currentId}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData),
//         });
//       } else {
//         // Create new address
//         response = await fetch('http://localhost:5000/api/addresses', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData),
//         });
//       }

//       const data = await response.json();
//       if (response.ok) {
//         toast.success('Address saved successfully!');
//         fetchAddresses();  // Re-fetch the addresses after adding or updating
//         setHouseNumber('');
//         setRoad('');
//         setCategory('Home');
//         setIsUpdating(false);  // Reset the update state
//         setCurrentId(null);
//       } else {
//         toast.error('Failed to save address');
//       }
//     } catch (err) {
//       toast.error('An error occurred while saving the address');
//     }
//   };

//   const handleEnableLocation = () => {
//     requestGeolocationPermission();
//   };

//   const handleSearchManually = () => {
//     setShowModal(false);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/addresses/${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         toast.success('Address deleted successfully');
//         fetchAddresses();  // Re-fetch the addresses after deletion
//       } else {
//         toast.error('Failed to delete address');
//       }
//     } catch (err) {
//       toast.error('An error occurred while deleting the address');
//     }
//   };

//   const handleEdit = (address) => {
//     setHouseNumber(address.houseNumber);
//     setRoad(address.road);
//     setCategory(address.category);
//     setLocation({ lat: address.latitude, lng: address.longitude });
//     setIsUpdating(true);
//     setCurrentId(address.id);  // Set the current address ID
//   };

//   return (
//     <div style={styles.container}>
//       {/* Modal */}
//       {showModal && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modalContent}>
//             <h3>Your Location Permission</h3>
//             <p>We need access to your location to update the delivery address.</p>
//             <div>
//               <button onClick={handleEnableLocation} style={styles.primaryButton}>
//                 Enable Location
//               </button>
//               <button onClick={handleSearchManually} style={styles.secondaryButton}>
//                 Search Manually
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <h2 style={styles.header}>Delivery Address Form</h2>

//       {permissionGranted && (
//         <div style={styles.mapContainer}>
//           <LoadScript googleMapsApiKey="AIzaSyBCSAEanzCQ0JL6vjBJfe0gEIOp2gueUpQ">
//             <GoogleMap
//               mapContainerStyle={styles.map}
//               center={location}
//               zoom={15}
//               onClick={(event) => {
//                 const latLng = event.latLng;
//                 handleLocationChange({ lat: latLng.lat(), lng: latLng.lng() });
//               }}
//             >
//               <Marker position={location} />
//             </GoogleMap>
//           </LoadScript>
//           <p>Selected Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} style={styles.form}>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>House/Flat/Block No.:</label>
//           <input
//             type="text"
//             value={houseNumber}
//             onChange={(e) => setHouseNumber(e.target.value)}
//             required
//             style={styles.input}
//           />
//         </div>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Apartment/Road/Area:</label>
//           <input
//             type="text"
//             value={road}
//             onChange={(e) => setRoad(e.target.value)}
//             required
//             style={styles.input}
//           />
//         </div>
//         <div style={styles.inputGroup}>
//           <label style={styles.label}>Category:</label>
//           <div style={styles.radioGroup}>
//             {['Home', 'Office', 'Friends & Family'].map((cat) => (
//               <label key={cat} style={styles.radioLabel}>
//                 <input
//                   type="radio"
//                   name="category"
//                   value={cat}
//                   checked={category === cat}
//                   onChange={() => setCategory(cat)}
//                   style={styles.radioInput}
//                 />
//                 {cat}
//               </label>
//             ))}
//           </div>
//         </div>
//         <button type="submit" style={styles.submitButton}>
//           {isUpdating ? 'Update Address' : 'Save Address'}
//         </button>
//       </form>

//       <h3 style={styles.header}>Saved Addresses</h3>
//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th style={styles.tableHeader}>House No.</th>
//             <th style={styles.tableHeader}>Road</th>
//             <th style={styles.tableHeader}>Category</th>
//             <th style={styles.tableHeader}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {addresses.map((address) => (
//             <tr key={address.id} style={styles.tableRow}>
//               <td>{address.houseNumber}</td>
//               <td>{address.road}</td>
//               <td>{address.category}</td>
//               <td style={styles.tableActions}>
//                 <button onClick={() => handleEdit(address)} style={styles.editButton}>
//                   Edit
//                 </button>
//                 <button onClick={() => handleDelete(address.id)} style={styles.deleteButton}>
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <ToastContainer />
//     </div>
//   );
// };

// // Styles
// const styles = {
//   container: {
//     maxWidth: '800px',
//     margin: '0 auto',
//     padding: '20px',
//     fontFamily: 'Arial, sans-serif',
//   },
//   modalOverlay: {
//     position: 'fixed',
//     top: '0',
//     left: '0',
//     right: '0',
//     bottom: '0',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: '20px',
//     borderRadius: '8px',
//     textAlign: 'center',
//   },
//   primaryButton: {
//     padding: '10px 20px',
//     backgroundColor: '#007bff',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
//   secondaryButton: {
//     padding: '10px 20px',
//     backgroundColor: '#6c757d',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
//   header: {
//     textAlign: 'center',
//     fontSize: '24px',
//     margin: '20px 0',
//   },
//   mapContainer: {
//     marginBottom: '20px',
//   },
//   map: {
//     height: '400px',
//     width: '100%',
//   },
//   form: {
//     marginBottom: '30px',
//   },
//   inputGroup: {
//     marginBottom: '15px',
//   },
//   label: {
//     display: 'block',
//     marginBottom: '5px',
//     fontWeight: 'bold',
//   },
//   input: {
//     width: '100%',
//     padding: '10px',
//     fontSize: '16px',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//   },
//   radioGroup: {
//     display: 'flex',
//     justifyContent: 'space-around',
//   },
//   radioLabel: {
//     marginRight: '15px',
//   },
//   radioInput: {
//     marginRight: '5px',
//   },
//   submitButton: {
//     padding: '10px 20px',
//     backgroundColor: '#28a745',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     width: '100%',
//     fontSize: '18px',
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginTop: '20px',
//   },
//   tableHeader: {
//     padding: '10px',
//     textAlign: 'left',
//     backgroundColor: '#f1f1f1',
//     fontWeight: 'bold',
//   },
//   tableRow: {
//     borderBottom: '1px solid #ddd',
//   },
//   tableActions: {
//     textAlign: 'center',
//   },
//   editButton: {
//     padding: '5px 10px',
//     backgroundColor: '#ffc107',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     marginRight: '10px',
//   },
//   deleteButton: {
//     padding: '5px 10px',
//     backgroundColor: '#dc3545',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
// };

// export default AddressForm;
