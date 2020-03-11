using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace SignalRChat.Controllers
{
    public class FileUploadController : ApiController
    {
        [HttpPost]
        public KeyValuePair<int, string> UploadFile()
        {
            try
            {
                if (HttpContext.Current.Request.Files.AllKeys.Any())
                {
                    // Get the uploaded image from the Files collection
                    var httpPostedFile = HttpContext.Current.Request.Files["UploadedImage"];

                    if (httpPostedFile != null)
                    {
                        // Validate the uploaded image(optional)

                        // Get the complete file path
                        var fileSavePath = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), httpPostedFile.FileName);

                        // Save the uploaded file to "UploadedFiles" folder
                        httpPostedFile.SaveAs(fileSavePath);

                        return new KeyValuePair<int, string>(1, fileSavePath);
                        //return new KeyValuePair<bool, string>(true, "File uploaded successfully.");
                    }

                    return new KeyValuePair<int, string>(2, "Could not get the uploaded file.");
                }

                return new KeyValuePair<int, string>(3, "No file found to upload.");
            }
            catch (Exception ex)
            {
                return new KeyValuePair<int, string>(101, "An error occurred while uploading the file. Error Message: " + ex.Message);
            }
        }
    }
}
