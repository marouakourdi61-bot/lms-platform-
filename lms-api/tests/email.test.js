const { renderTemplate} = require("../services/email/templateService");

describe("Email templates", () => {


  test("replaces the name in the welcome template", () => {
    const html = renderTemplate("welcome", {
      name: "Mehdi",
    });

    expect(html).toContain(
      "Bienvenue sur notre LMS, Mehdi !"
    );

    expect(html).not.toContain("{{name}}");
  });



   test("replaces the name and course in the enrollment template", () => {
    const html = renderTemplate("enrollment", {
      name: "Mehdi",
      course: "JavaScript",
    });

    expect(html).toContain("Bienvenue Mehdi !");
    expect(html).toContain("Vous êtes inscrit au cours : JavaScript");
    expect(html).not.toContain("{{name}}");
    expect(html).not.toContain("{{course}}");
  });


});